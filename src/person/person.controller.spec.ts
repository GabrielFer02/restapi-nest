import { PersonController } from './person.controller';

describe('PersonController', () => {
  let controller: PersonController;
  const personServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadPicture: jest.fn(),
  };
  beforeEach(() => {
    controller = new PersonController(personServiceMock as any);
  });
  it('create - deve usar o PersonService com o argumento correto', async () => {
    const argument = { key: 'value' };
    const expected = { anyKey: 'anyValue' };
    jest.spyOn(personServiceMock, 'create').mockResolvedValue(expected);
    const result = await controller.create(argument as any);
    expect(personServiceMock.create).toHaveBeenCalledWith(argument);
    expect(result).toEqual(expected);
  });
  it('findAll - deve usar o PersonService', async () => {
    const expected = { anyKey: 'anyValue' };
    jest.spyOn(personServiceMock, 'findAll').mockResolvedValue(expected);
    const result = await controller.findAll();
    expect(personServiceMock.create).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });
  it('findOne - deve usar o PersonService com o argumento correto', async () => {
    const argument = '1';
    const expected = { anyKey: 'anyValue' };
    jest.spyOn(personServiceMock, 'findOne').mockResolvedValue(expected);
    const result = await controller.findOne(argument as any);
    expect(personServiceMock.findOne).toHaveBeenCalledWith(+argument);
    expect(result).toEqual(expected);
  });
  it('update - deve usar o PersonService com os argumentos corretos', async () => {
    const argument1 = '1';
    const argument2 = { key: 'value' };
    const argument3 = { key: 'value' };
    const expected = { anyKey: 'anyValue' };
    jest.spyOn(personServiceMock, 'update').mockResolvedValue(expected);
    const result = await controller.update(
      argument1,
      argument2 as any,
      argument3 as any,
    );
    expect(personServiceMock.update).toHaveBeenCalledWith(
      +argument1,
      argument2,
      argument3,
    );
    expect(result).toEqual(expected);
  });
  it('remove - deve usar o PessoaService com os argumentos corretos', async () => {
    const argument1 = 1;
    const argument2 = { aKey: 'aValue' };
    const expected = { anyKey: 'anyValue' };
    jest.spyOn(personServiceMock, 'remove').mockResolvedValue(expected);
    const result = await controller.remove(argument1 as any, argument2 as any);
    expect(personServiceMock.remove).toHaveBeenCalledWith(
      +argument1,
      argument2,
    );
    expect(result).toEqual(expected);
  });
  it('uploadPicture - deve usar o PessoaService com os argumentos corretos', async () => {
    const argument1 = { aKey: 'aValue' };
    const argument2 = { bKey: 'bValue' };
    const expected = { anyKey: 'anyValue' };
    jest.spyOn(personServiceMock, 'uploadPicture').mockResolvedValue(expected);
    const result = await controller.uploadPicture(
      argument1 as any,
      argument2 as any,
    );
    expect(personServiceMock.uploadPicture).toHaveBeenCalledWith(
      argument1,
      argument2,
    );
    expect(result).toEqual(expected);
  });
});
