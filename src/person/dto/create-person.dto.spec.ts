import { validate } from 'class-validator';
import { CreatePersonDto } from './create-person.dto';
describe('CreatePersonDto', () => {
  it('deve validar um DTO válido', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'teste@example.com';
    dto.password = 'senha123';
    dto.name = 'Luiz Otávio';
    const errors = await validate(dto);
    expect(errors.length).toBe(0); // Nenhum erro significa que o DTO é válido
  });
  it('deve falhar se o email for inválido', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'email-invalido';
    dto.password = 'senha123';
    dto.name = 'Luiz Otávio';
    const errors = await validate(dto);
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
  });
  it('deve falhar se a senha for muito curta', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'teste@example.com';
    dto.password = '123';
    dto.name = 'Luiz Otávio';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
  it('deve falhar se o nome for vazio', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'teste@example.com';
    dto.password = 'senha123';
    dto.name = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });
  it('deve falhar se o nome for muito longo', async () => {
    const dto = new CreatePersonDto();
    dto.email = 'teste@example.com';
    dto.password = 'senha123';
    dto.name = 'a'.repeat(101);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });
});
