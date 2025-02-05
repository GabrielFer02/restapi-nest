import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Repository } from 'typeorm';
import { HashingServiceProtocol } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly hashingServiceProtocol: HashingServiceProtocol,
  ) {}

  notFoundException() {
    throw new NotFoundException('Pessoa não eoncontrada');
  }

  async create(createPersonDto: CreatePersonDto) {
    try {
      const passwordHash = await this.hashingServiceProtocol.hash(
        createPersonDto.password,
      );

      const personData = {
        email: createPersonDto.email,
        name: createPersonDto.name,
        passwordHash,
      };

      const newPerson = this.personRepository.create(personData);
      await this.personRepository.save(newPerson);
      return newPerson;
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('E-mail já cadastrado');

      throw error;
    }
  }

  async findAll() {
    const person = await this.personRepository.find({ order: { id: 'desc' } });

    return person;
  }

  async findOne(id: number) {
    const person = await this.personRepository.findOneBy({ id });

    if (!person) this.notFoundException();

    return person;
  }

  async update(
    id: number,
    updatePersonDto: UpdatePersonDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const personData = {
      name: updatePersonDto.name,
    };

    if (updatePersonDto.password) {
      const passwordHash = await this.hashingServiceProtocol.hash(
        updatePersonDto.password,
      );
      personData['passwordHash'] = passwordHash;
    }

    const person = await this.personRepository.preload({
      id,
      ...personData,
    });

    if (!person) this.notFoundException();

    if (person.id !== tokenPayload.sub)
      throw new ForbiddenException('Unauthorized person');

    return this.personRepository.save(person);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const person = await this.personRepository.findOneBy({ id });

    if (!person) this.notFoundException();

    if (person.id !== tokenPayload.sub)
      throw new ForbiddenException('Unauthorized person');

    return this.personRepository.remove(person);
  }
}
