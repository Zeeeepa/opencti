import { describe, expect, it } from 'vitest';
import gql from 'graphql-tag';
import { adminQuery } from '../../utils/testQuery';
import { TokenDuration } from '../../../src/generated/graphql';

const USER_TOKEN_ADD_MUTATION = gql`
  mutation UserTokenAdd($input: UserTokenAddInput!) {
    userTokenAdd(input: $input) {
      token_id
      plaintext_token
      expires_at
      masked_token
    }
  }
`;

describe('User Token Integration', () => {
  it('should generate a secure token with masked version returned', async () => {
    const input = {
      description: 'Integration Test Token',
      duration: TokenDuration.Unlimited,
    };

    const result = await adminQuery({
      query: USER_TOKEN_ADD_MUTATION,
      variables: { input },
    });

    if (result.errors) {
      console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    }

    const data = result.data?.userTokenAdd;
    expect(data).toBeDefined();
    expect(data.token_id).toBeDefined();
    expect(data.plaintext_token).toBeDefined();
    expect(data.plaintext_token.startsWith('flgrn_octi_tkn_')).toBe(true);
    expect(data.masked_token).toBeDefined();
    expect(data.masked_token.startsWith('****')).toBe(true);
    expect(data.expires_at).toBeNull();
  });
});
