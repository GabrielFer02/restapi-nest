import { Repository } from 'typeorm';
import { PersonService } from './person.service';
import { Person } from './entities/person.entity';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePersonDto } from './dto/create-person.dto';

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

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);

      await personService.create(createPersonDto);

      expect(hashingService.hash).toHaveBeenCalledWith(
        createPersonDto.password,
      );

      expect(personRepository.create).toHaveBeenCalledWith({
        email: createPersonDto.email,
        passwordHash,
        name: createPersonDto.name,
      });
    });
  });
});
