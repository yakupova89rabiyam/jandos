import { z, ZodSchema } from 'zod';

/**
 * Middleware factory: validates req.body against a Zod schema.
 * On failure returns 400 with a list of field errors.
 */
export const validate = (schema: ZodSchema) => {
  return (req: any, res: any, next: any) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ error: 'Ошибка валидации', details: errors });
    }
    req.body = result.data; // use parsed (and coerced) data
    next();
  };
};

// ─── Shared Schemas ───────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email('Введите корректный email'),
  name: z.string().min(2, 'Имя должно быть не менее 2 символов').max(100),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов').max(100),
});

export const LoginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string().min(6, 'Новый пароль должен быть не менее 6 символов'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Введите корректный email'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().max(500000).optional(),
  phone: z.string().max(20).optional(),
  birthday: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  about: z.string().max(1000).optional(),
});

export const PetSchema = z.object({
  name: z.string().min(1, 'Введите имя питомца').max(100),
  category: z.string().min(1, 'Выберите категорию'),
  breed: z.string().max(100).optional().default(''),
  age: z.string().max(50).optional().default(''),
  ageGroup: z.string().max(50).optional().default(''),
  gender: z.string().optional().default(''),
  color: z.string().max(50).optional().default(''),
  size: z.string().max(50).optional().default(''),
  description: z.string().max(2000).optional().default(''),
  notes: z.string().max(2000).optional().default(''),
  image: z.string().optional().default(''),
  status: z.enum(['available', 'adopted', 'reserved', 'treatment']).optional().default('available'),
});

export const NewsSchema = z.object({
  title: z.string().min(1, 'Введите заголовок').max(200),
  content: z.string().min(1, 'Введите содержание'),
  excerpt: z.string().max(500).optional().default(''),
  image: z.string().optional().default(''),
  date: z.string().optional().default(''),
  category: z.string().optional().default(''),
  featured: z.number().int().min(0).max(1).optional().default(0),
});

export const FundraiserSchema = z.object({
  title: z.string().min(1, 'Введите название').max(200),
  target_amount: z.number().int().positive('Укажите целевую сумму'),
  current_amount: z.number().int().min(0).optional().default(0),
  description: z.string().max(2000).optional().default(''),
  image: z.string().optional().default(''),
  status: z.enum(['active', 'completed', 'paused']).optional().default('active'),
});

export const DonationSchema = z.object({
  fundraiser_id: z.number().int().positive(),
  amount: z.number().int().positive('Укажите сумму пожертвования'),
});

export const AdoptionRequestSchema = z.object({
  pet_id: z.number().int().positive(),
  message: z.string().max(1000).optional().default(''),
});

export const VolunteerApplicationSchema = z.object({
  skills: z.string().max(500).optional().default(''),
  experience: z.string().max(500).optional().default(''),
});

export const ShiftSchema = z.object({
  user_id: z.number().int().positive(),
  date: z.string().min(1, 'Укажите дату'),
  start_time: z.string().optional().default(''),
  end_time: z.string().optional().default(''),
  task: z.string().max(500).optional().default(''),
});

export const FeedbackSchema = z.object({
  name: z.string().min(1, 'Введите имя').max(100),
  email: z.string().email('Введите корректный email'),
  subject: z.string().max(200).optional().default(''),
  message: z.string().min(1, 'Введите сообщение').max(2000),
});

export const BroadcastSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
});

export const GraduateSchema = z.object({
  name: z.string().min(1).max(100),
  story: z.string().max(1000).optional().default(''),
  image: z.string().optional().default(''),
  lat: z.number().optional(),
  lng: z.number().optional(),
  district: z.string().max(100).optional().default(''),
  adoption_date: z.string().optional().default(''),
});

export const ShiftSlotSchema = z.object({
  type: z.enum(['walking', 'cleaning', 'feeding']),
  date: z.string().min(1, 'Укажите дату'),
  time: z.string().min(1, 'Укажите время'),
  slots: z.number().int().positive('Укажите количество мест'),
  description: z.string().max(2000).optional().default(''),
  location: z.string().max(200).optional().default(''),
  contact: z.string().max(200).optional().default(''),
});

export const VerifyCodeSchema = z.object({
  email: z.string().email('Введите корректный email'),
  code: z.string().length(4, 'Введите 4-значный код').regex(/^\d{4}$/, 'Код должен состоять из 4 цифр'),
});
