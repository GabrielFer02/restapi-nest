import { Repository } from 'typeorm';
import { PersonService } from './person.service';
import { Person } from './entities/person.entity';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePersonDto } from './dto/create-person.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'node:path';
import * as fs from 'fs/promises';
jest.mock('fs/promises');

describe('PersonService', () => {
  let personService: PersonService;
  let personRepository: Repository<Person>;
  let hashingService: HashingServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: getRepositoryToken(Person),
          useValue: {
            save: jest.fn(),
            create: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HashingServiceProtocol,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    personService = module.get<PersonService>(PersonService);
    personRepository = module.get<Repository<Person>>(
      getRepositoryToken(Person),
    );
    hashingService = module.get<HashingServiceProtocol>(HashingServiceProtocol);
  });

  it('should be defined', () => {
    expect(personService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new person', async () => {
      const createPersonDto: CreatePersonDto = {
        email: 'gabriel@gmail.com',
        name: 'gabriel',
        password: '123456',
      };
      const passwordHash = 'HASHDESENHA';

      const newPerson = {
        id: 1,
        name: createPersonDto.name,
        email: createPersonDto.email,
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(personRepository, 'create')
        .mockReturnValue(newPerson as Person);

      const result = await personService.create(createPersonDto);

      expect(hashingService.hash).toHaveBeenCalledWith(
        createPersonDto.password,
      );

      expect(personRepository.create).toHaveBeenCalledWith({
        email: createPersonDto.email,
        passwordHash,
        name: createPersonDto.name,
      });

      expect(personRepository.save).toHaveBeenCalledWith(newPerson);
      expect(result).toEqual(newPerson);
    });

    it('deve lançar uma ConflictException quando e-mail já existe', async () => {
      jest.spyOn(personRepository, 'save').mockRejectedValue({ code: '23505' });

      await expect(personService.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar uma Erro genérico quando o erro for lançado', async () => {
      jest
        .spyOn(personRepository, 'save')
        .mockRejectedValue(new Error('Erro genérico'));

      await expect(personService.create({} as any)).rejects.toThrow(
        new Error('Erro genérico'),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma pessoa se a pessoa for encontrada', async () => {
      const personId = 1;
      const personFinded = {
        id: personId,
        name: 'Gabriel',
        email: 'gabriel@gmail.com',
        password: '123456',
      };

      jest
        .spyOn(personRepository, 'findOneBy')
        .mockResolvedValue(personFinded as any);

      const result = await personService.findOne(personId);

      expect(result).toEqual(personFinded);
    });

    it('deve retornar um erro quando uma pessoa não for encontrada', async () => {
      await expect(personService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as pessoas', async () => {
      const personMock: Person[] = [];

      jest.spyOn(personRepository, 'find').mockResolvedValue(personMock);

      const result = await personService.findAll();

      expect(result).toEqual(personMock);
      expect(personRepository.find).toHaveBeenCalledWith({
        order: { id: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar uma pessoa', async () => {
      const personId = 1;
      const updatePersonDto = {
        name: 'Gabriel',
        password: '123456',
      };
      const tokenPayload = {
        sub: personId,
      } as any;
      const passwordHash = 'HASHDESENHA';
      const updatePerson = { id: personId, name: 'Gabriel', passwordHash };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(personRepository, 'preload')
        .mockResolvedValue(updatePerson as any);
      jest
        .spyOn(personRepository, 'save')
        .mockResolvedValue(updatePerson as any);

      const result = await personService.update(
        personId,
        updatePersonDto,
        tokenPayload,
      );

      expect(result).toEqual(updatePerson);
      expect(hashingService.hash).toHaveBeenCalledWith(
        updatePersonDto.password,
      );
      expect(personRepository.preload).toHaveBeenCalledWith({
        id: personId,
        name: updatePersonDto.name,
        passwordHash,
      });
      expect(personRepository.save).toHaveBeenLastCalledWith(updatePerson);
    });

    it('deve lançar ForbidddenException se usuário não autorizado', async () => {
      const personId = 1;
      const tokenPayload = { sub: 2 } as any;
      const updatePersonDto = { name: 'Gabriel' };
      const existingPerson = { id: personId, name: 'Gabriel' };

      jest
        .spyOn(personRepository, 'preload')
        .mockResolvedValue(existingPerson as any);

      await expect(
        personService.update(personId, updatePersonDto, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se a pessoa não existe', async () => {
      const personId = 1;
      const tokenPayload = { sub: personId } as any;
      const updatePersonDto = { name: 'Gabriel' };

      jest.spyOn(personRepository, 'preload').mockResolvedValue(null);

      await expect(
        personService.update(personId, updatePersonDto, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma pessoa se autorizado', async () => {
      const personId = 1;
      const tokenPayload = { sub: personId } as any;
      const existingPerson = { id: personId, name: 'Gabriel' };

      jest
        .spyOn(personRepository, 'findOneBy')
        .mockResolvedValue(existingPerson as any);

      jest
        .spyOn(personRepository, 'remove')
        .mockResolvedValue(existingPerson as any);

      const result = await personService.remove(personId, tokenPayload);

      expect(personRepository.findOneBy).toHaveBeenCalledWith({ id: personId });
      expect(personRepository.remove).toHaveBeenCalledWith(existingPerson);
      expect(result).toEqual(existingPerson);
    });

    it('deve lançar ForbiddenException se não autorizado', async () => {
      const personId = 1;
      const tokenPayload = { sub: 2 } as any;
      const existingPerson = { id: personId, name: 'Gabriel' };

      jest
        .spyOn(personRepository, 'findOneBy')
        .mockResolvedValue(existingPerson as any);

      await expect(
        personService.remove(personId, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se a pessoa não existir', async () => {
      const personId = 1;
      const tokenPayload = { sub: personId } as any;

      jest
        .spyOn(personRepository, 'findOneBy')
        .mockRejectedValue(new NotFoundException());

      await expect(
        personService.remove(personId, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadPicture', () => {
    it('deve salvar a imagem corretamente e atualizar a pessoa', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file Content'),
      } as Express.Multer.File;

      const mockPerson = {
        id: 1,
        name: 'Gabriel',
        email: 'gabriel@gmail.com',
      } as Person;
      const tokenPayload = { sub: 1 } as any;

      jest.spyOn(personRepository, 'findOneBy').mockResolvedValue(mockPerson);
      jest
        .spyOn(personRepository, 'save')
        .mockResolvedValue({ ...mockPerson, picture: '1.png' });

      const filePath = path.resolve(process.cwd(), 'pictures', '1.png');

      const result = await personService.uploadPicture(mockFile, tokenPayload);

      expect(fs.writeFile).toHaveBeenCalledWith(filePath, mockFile.buffer);
      expect(personRepository.save).toHaveBeenCalledWith({
        ...mockPerson,
        picture: '1.png',
      });
      expect(result).toEqual({ ...mockPerson, picture: '1.png' });
    });

    it('deve lançar uma BadRequestException se o arquivo for muito pequeno', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 500,
        buffer: Buffer.from('small content'),
      } as Express.Multer.File;
      const tokenPayload = { sub: 1 } as any;

      await expect(
        personService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar NotFoundException se a pessoa não for encontrada', async () => {
      const mockFile = {
        originalname: 'test.png',
        size: 2000,
        buffer: Buffer.from('file Content'),
      } as Express.Multer.File;

      const tokenPayload = {
        sub: 1,
      } as any;

      jest
        .spyOn(personRepository, 'findOneBy')
        .mockRejectedValue(new NotFoundException());

      await expect(
        personService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
