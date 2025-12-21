import { UserService } from '../../src/services/user.service';
import { UserModel } from '../../src/models/user.model';

jest.mock('../../src/models/user.model');

describe('UserService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //getUserByProfile
  test('getUserByProfile, should return a formatted user without password', async () => {
    const mockUser = {
      email: 'john.doe@email.com',
      role: 'user',
      firstName: 'John',
      lastName: 'Doe',
      biography:
        'Full-stack developer with 3 years of experience. Currently looking for new opportunities.',
      interest: 'Web Development, DevOps',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const result = await UserService.getUserByProfile('userId');

    expect(UserModel.findById).toHaveBeenCalledWith('userId');
    expect(result.email).toBe('john.doe@email.com');
    expect(result.password).toBe('');
  });

  test('getUserByProfile , should throw USER_NOT_FOUND', async () => {
    (UserModel.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(UserService.getUserByProfile('unknown')).rejects.toMatchObject({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
    });
  });

  //putUserByProfile
  test('putUserByProfile, should update user and strip sensitive fields', async () => {
    const mockUpdatedUser = {
      email: 'john@example.com',
      role: 'user',
      firstName: 'JohnUpdated',
      lastName: 'Doe',
      profilePicture: 'updated.jpg',
      biography: 'Updated Bio',
      interest: 'Tech',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUpdatedUser),
    });

    const data: Partial<any> = {
      email: 'testTheJestTest@gmail.com',
      role: 'admin',
      password: 'abc123',
      firstName: 'JohnUpdated',
    };

    const result = await UserService.putUserByProfile('userId', data);

    //Sensitive fields must be removed before db update
    expect((data as any).email).toBeUndefined();
    expect((data as any).role).toBeUndefined();
    expect((data as any).password).toBeUndefined();

    expect(result.firstName).toBe('JohnUpdated');
    expect(result.password).toBe('');
  });

  test('putUserByProfile, should throw USER_NOT_FOUND when updating', async () => {
    (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await expect(
      UserService.putUserByProfile('unknown', { firstName: 'Test' })
    ).rejects.toMatchObject({
      message: 'User not found',
      code: 'USER_NOT_FOUND',
    });
  });
});
