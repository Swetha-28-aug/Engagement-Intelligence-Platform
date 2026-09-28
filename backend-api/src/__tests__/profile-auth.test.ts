import { profileUpdateSchema, SAFE_PROFILE_SELECT } from '../routes/users.routes';
import { ROLES, ROLE_PERMISSIONS } from '../prisma/permission-catalog';

// ─── profileUpdateSchema validation ───

describe('profileUpdateSchema — field rejection', () => {
  function validate(body: unknown) {
    return profileUpdateSchema.validate(body, { allowUnknown: false, stripUnknown: false, abortEarly: false });
  }

  it('rejects empty body (min 1 field required)', () => {
    expect(validate({}).error).toBeDefined();
    expect(validate({}).error!.message).toContain('at least one');
  });

  it('rejects unknown fields like email', () => {
    const { error } = validate({ email: 'hack@evil.com' });
    expect(error).toBeDefined();
    expect(error!.message).toContain('not allowed');
  });

  it('rejects unknown fields like role', () => {
    const { error } = validate({ role: 'ADMIN' });
    expect(error).toBeDefined();
  });

  it('rejects unknown fields like status', () => {
    const { error } = validate({ status: 'ACTIVE' });
    expect(error).toBeDefined();
  });

  it('rejects unknown fields like department', () => {
    const { error } = validate({ department: 'CS' });
    expect(error).toBeDefined();
  });

  it('rejects unknown fields like year', () => {
    const { error } = validate({ year: 3 });
    expect(error).toBeDefined();
  });

  it('rejects unknown fields like password', () => {
    const { error } = validate({ password: 'secret123456' });
    expect(error).toBeDefined();
  });

  it('accepts name + phone together', () => {
    const { error, value } = validate({ name: 'Test User', phone: '+1 555-1234' });
    expect(error).toBeUndefined();
    expect(value.name).toBe('Test User');
    expect(value.phone).toBe('+1 555-1234');
  });

  it('accepts name only', () => {
    expect(validate({ name: 'Test' }).error).toBeUndefined();
  });

  it('accepts phone only', () => {
    expect(validate({ phone: '+91 12345 67890' }).error).toBeUndefined();
  });

  it('allows phone: null to clear it', () => {
    const { error, value } = validate({ phone: null });
    expect(error).toBeUndefined();
    expect(value.phone).toBeNull();
  });
});

describe('profileUpdateSchema — name edge cases', () => {
  function validate(body: unknown) {
    return profileUpdateSchema.validate(body, { allowUnknown: false, stripUnknown: false, abortEarly: false });
  }

  it('rejects empty name after trim', () => {
    expect(validate({ name: '   ' }).error).toBeDefined();
  });

  it('rejects name with null byte', () => {
    expect(validate({ name: 'Bad\x00Name' }).error).toBeDefined();
  });

  it('rejects name with DEL character', () => {
    expect(validate({ name: 'Bad\x7fName' }).error).toBeDefined();
  });

  it('accepts unicode names', () => {
    expect(validate({ name: 'José García-López' }).error).toBeUndefined();
  });

  it('accepts Tamil script names', () => {
    expect(validate({ name: 'ஜோவன்னா' }).error).toBeUndefined();
  });

  it('trims leading/trailing whitespace', () => {
    const { value } = validate({ name: '  Trimmed  ' });
    expect(value.name).toBe('Trimmed');
  });

  it('rejects name at 256 chars', () => {
    expect(validate({ name: 'A'.repeat(256) }).error).toBeDefined();
  });

  it('accepts name at exactly 255 chars', () => {
    expect(validate({ name: 'A'.repeat(255) }).error).toBeUndefined();
  });
});

describe('profileUpdateSchema — phone edge cases', () => {
  function validate(body: unknown) {
    return profileUpdateSchema.validate(body, { allowUnknown: false, stripUnknown: false, abortEarly: false });
  }

  it('rejects phone with letters', () => {
    expect(validate({ phone: 'call-me-maybe' }).error).toBeDefined();
  });

  it('rejects phone with too few digits (6)', () => {
    expect(validate({ phone: '123456' }).error).toBeDefined();
  });

  it('accepts phone with exactly 7 digits', () => {
    expect(validate({ phone: '1234567' }).error).toBeUndefined();
  });

  it('rejects phone with 16 digits', () => {
    expect(validate({ phone: '1234567890123456' }).error).toBeDefined();
  });

  it('accepts phone with 15 digits', () => {
    expect(validate({ phone: '123456789012345' }).error).toBeUndefined();
  });

  it('rejects phone exceeding 30 characters', () => {
    expect(validate({ phone: '+1 (555) 123-4567 ext. 12345678' }).error).toBeDefined();
  });

  it('converts empty string phone to null', () => {
    const { error, value } = validate({ phone: '  ' });
    expect(error).toBeUndefined();
    expect(value.phone).toBeNull();
  });

  it('accepts formatted international phone', () => {
    expect(validate({ phone: '+44 (20) 7946-0958' }).error).toBeUndefined();
  });
});

// ─── SAFE_PROFILE_SELECT ───

describe('SAFE_PROFILE_SELECT — safe field list', () => {
  it('includes expected user fields', () => {
    expect(SAFE_PROFILE_SELECT).toHaveProperty('id', true);
    expect(SAFE_PROFILE_SELECT).toHaveProperty('name', true);
    expect(SAFE_PROFILE_SELECT).toHaveProperty('email', true);
    expect(SAFE_PROFILE_SELECT).toHaveProperty('phone', true);
    expect(SAFE_PROFILE_SELECT).toHaveProperty('department', true);
    expect(SAFE_PROFILE_SELECT).toHaveProperty('year', true);
    expect(SAFE_PROFILE_SELECT).toHaveProperty('status', true);
    expect(SAFE_PROFILE_SELECT).toHaveProperty('createdAt', true);
    expect(SAFE_PROFILE_SELECT).toHaveProperty('updatedAt', true);
  });

  it('includes role with id and name only', () => {
    expect(SAFE_PROFILE_SELECT.role).toEqual({ select: { id: true, name: true } });
  });

  it('does NOT include passwordHash', () => {
    expect(SAFE_PROFILE_SELECT).not.toHaveProperty('passwordHash');
  });

  it('does NOT include any token-related fields', () => {
    const keys = Object.keys(SAFE_PROFILE_SELECT);
    expect(keys).not.toContain('refreshTokens');
    expect(keys).not.toContain('activationTokens');
    expect(keys).not.toContain('passwordResetTokens');
  });
});

// ─── Permission catalog: all 6 roles have users:update:self ───

describe('Permission Catalog — profile permissions', () => {
  const allRoleNames = Object.values(ROLES);

  it('defines all 6 expected roles', () => {
    expect(allRoleNames).toContain('STUDENT');
    expect(allRoleNames).toContain('TRAINER');
    expect(allRoleNames).toContain('FACULTY');
    expect(allRoleNames).toContain('MENTOR');
    expect(allRoleNames).toContain('COORDINATOR');
    expect(allRoleNames).toContain('ADMIN');
    expect(allRoleNames.length).toBe(6);
  });

  it('every role has users:update:self permission for profile editing', () => {
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      expect(permissions).toContain('users:update:self');
    }
  });

  it('every role has users:read:own permission for profile viewing', () => {
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      expect(permissions).toContain('users:read:own');
    }
  });

  it('only ADMIN has users:change_role', () => {
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      if (roleName === 'ADMIN') {
        expect(permissions).toContain('users:change_role');
      } else {
        expect(permissions).not.toContain('users:change_role');
      }
    }
  });

  it('STUDENT does not have users:create', () => {
    expect(ROLE_PERMISSIONS.STUDENT).not.toContain('users:create');
  });

  it('ADMIN has users:create', () => {
    expect(ROLE_PERMISSIONS.ADMIN).toContain('users:create');
  });
});
