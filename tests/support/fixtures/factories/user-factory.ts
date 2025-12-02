/**
 * User Factory for test data generation
 *
 * Generates test users with auto-cleanup.
 * Uses faker for realistic data - install with: npm install -D @faker-js/faker
 */

interface TestUser {
  id?: string;
  email: string;
  name: string;
  password: string;
}

export class UserFactory {
  private createdUsers: string[] = [];

  /**
   * Create a test user with optional overrides
   */
  async createUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    const timestamp = Date.now();
    const user: TestUser = {
      email: overrides.email || `test-${timestamp}@example.com`,
      name: overrides.name || `Test User ${timestamp}`,
      password: overrides.password || `TestPass${timestamp}!`,
      ...overrides,
    };

    // TODO: Replace with actual API call when auth endpoints are ready
    // Example with Supabase:
    // const { data, error } = await supabase.auth.signUp({
    //   email: user.email,
    //   password: user.password,
    // });

    // For now, return mock user for test scaffolding
    user.id = `user-${timestamp}`;
    this.createdUsers.push(user.id);

    return user;
  }

  /**
   * Cleanup all created users after test
   */
  async cleanup(): Promise<void> {
    for (const userId of this.createdUsers) {
      // TODO: Replace with actual cleanup when endpoints are ready
      // Example: await supabase.auth.admin.deleteUser(userId);
      console.log(`[Cleanup] Would delete user: ${userId}`);
    }
    this.createdUsers = [];
  }
}
