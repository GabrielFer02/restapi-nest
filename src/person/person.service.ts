import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  notFoundException() {
    throw new NotFoundException('Pessoa não eoncontrada');
  }

  create(createPersonDto: CreatePersonDto) {
    try {
      const personData = {
        email: createPersonDto.email,
        name: createPersonDto.name,
        passwordHash: createPersonDto.password,
      };

      const newPerson = this.personRepository.create(personData);
      return this.personRepository.save(newPerson);

      // return newPerson;
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

  async update(id: number, updatePersonDto: UpdatePersonDto) {
    const personData = {
      name: updatePersonDto.name,
      passwordHash: updatePersonDto.password,
    };

    const person = await this.personRepository.preload({ id, ...personData });

    if (!person) this.notFoundException();

    return this.personRepository.save(person);
  }

  async remove(id: number) {
    const person = await this.personRepository.findOneBy({ id });

    if (!person) this.notFoundException();

    return this.personRepository.remove(person);
  }
}
