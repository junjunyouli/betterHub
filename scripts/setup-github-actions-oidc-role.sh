#!/usr/bin/env bash
set -euo pipefail

ROLE_NAME="${ROLE_NAME:-betterhub-github-actions}"
GITHUB_REPO="${GITHUB_REPO:-junjunyouli/betterHub}"
# 信任范围精确到分支：只有该分支上的 workflow 能假设部署角色。
# 不按 GitHub environment 放行——否则任何能对该 environment 运行的 workflow（含其他分支/PR）都能假设本角色，绕过仅主分支限制。
GITHUB_BRANCH="${GITHUB_BRANCH:-main}"
AWS_REGION="${AWS_REGION:-us-west-2}"
OIDC_PROVIDER_HOST="token.actions.githubusercontent.com"
OIDC_PROVIDER_URL="https://${OIDC_PROVIDER_HOST}"
OIDC_AUDIENCE="sts.amazonaws.com"
OIDC_THUMBPRINT="${OIDC_THUMBPRINT:-6938fd4d98bab03faadb97b34396831e3780aea1}"
POLICY_NAME="${POLICY_NAME:-BetterHubSamDeployPolicy}"

command -v aws >/dev/null 2>&1 || {
	echo "aws CLI is required." >&2
	exit 1
}

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
OIDC_PROVIDER_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER_HOST}"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

trust_policy_file="${tmp_dir}/trust-policy.json"
deploy_policy_file="${tmp_dir}/sam-deploy-policy.json"

cat >"$trust_policy_file" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "${OIDC_PROVIDER_ARN}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_PROVIDER_HOST}:aud": "${OIDC_AUDIENCE}"
        },
        "StringLike": {
          "${OIDC_PROVIDER_HOST}:sub": "repo:${GITHUB_REPO}:ref:refs/heads/${GITHUB_BRANCH}"
        }
      }
    }
  ]
}
JSON

cat >"$deploy_policy_file" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationDeployment",
      "Effect": "Allow",
      "Action": [
        "cloudformation:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "SamArtifactBuckets",
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ServerlessResources",
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "logs:*",
        "events:*",
        "ecr:*"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IamForSamManagedResources",
      "Effect": "Allow",
      "Action": [
        "iam:AttachRolePolicy",
        "iam:CreateRole",
        "iam:CreateServiceLinkedRole",
        "iam:DeleteRole",
        "iam:DeleteRolePolicy",
        "iam:DetachRolePolicy",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListAttachedRolePolicies",
        "iam:ListRolePolicies",
        "iam:PassRole",
        "iam:PutRolePolicy",
        "iam:TagRole",
        "iam:UpdateAssumeRolePolicy"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ReadRuntimeConfiguration",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "kms:DescribeKey",
        "kms:Decrypt",
        "kms:ListAliases",
        "rds:Describe*",
        "secretsmanager:DescribeSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:ListSecrets"
      ],
      "Resource": "*"
    }
  ]
}
JSON

if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_PROVIDER_ARN" >/dev/null 2>&1; then
	echo "OIDC provider already exists: ${OIDC_PROVIDER_ARN}"
else
	aws iam create-open-id-connect-provider \
		--url "$OIDC_PROVIDER_URL" \
		--client-id-list "$OIDC_AUDIENCE" \
		--thumbprint-list "$OIDC_THUMBPRINT" >/dev/null
	echo "Created OIDC provider: ${OIDC_PROVIDER_ARN}"
fi

if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
	aws iam update-assume-role-policy \
		--role-name "$ROLE_NAME" \
		--policy-document "file://${trust_policy_file}" >/dev/null
	echo "Updated role trust policy: ${ROLE_ARN}"
else
	aws iam create-role \
		--role-name "$ROLE_NAME" \
		--assume-role-policy-document "file://${trust_policy_file}" \
		--description "GitHub Actions OIDC role for betterHub AWS SAM deployments" >/dev/null
	echo "Created role: ${ROLE_ARN}"
fi

aws iam put-role-policy \
	--role-name "$ROLE_NAME" \
	--policy-name "$POLICY_NAME" \
	--policy-document "file://${deploy_policy_file}" >/dev/null

echo "Attached/updated inline policy: ${POLICY_NAME}"
echo "AWS_GITHUB_ACTIONS_ROLE_ARN=${ROLE_ARN}"
