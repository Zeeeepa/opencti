import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addUserToken } from '../../../../src/modules/user/user-domain';
import { patchAttribute } from '../../../../src/database/middleware';
import { ENTITY_TYPE_USER } from '../../../../src/schema/internalObject';
import { TokenDuration } from '../../../../src/generated/graphql';

// Mock dependencies
vi.mock('../../../../src/database/middleware', () => ({
  patchAttribute: vi.fn(),
  updateAttribute: vi.fn(),
}));

vi.mock('../../../../src/listener/UserActionListener', () => ({
  publishUserAction: vi.fn(),
}));

describe('Modules > User > UserDomain', () => {
  const context = { user: { id: 'admin' } } as any;
  const user = { id: 'user-1', name: 'User 1' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a user token and log action', async () => {
    const input = { description: 'My Token', duration: TokenDuration.Unlimited };

    const result = await addUserToken(context, user, input);

    expect(result.plaintext_token).toBeDefined();
    expect(result.plaintext_token.startsWith('flgrn_octi_tkn_')).toBe(true);
    expect(result.token_id).toBeDefined();

    // Verify patchAttribute call
    expect(patchAttribute).toHaveBeenCalledWith(
      context,
      user,
      user.id,
      ENTITY_TYPE_USER,
      expect.objectContaining({
        api_tokens: expect.arrayContaining([
          expect.objectContaining({
            name: 'My Token',
            masked_token: expect.stringMatching(/^\*\*\*\*/),
            hash: expect.any(String),
            created_at: expect.any(String),
          }),
        ]),
      }),
      { operation: 'add' },
    );
  });
});
