import { Column, Entity, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users';
import { BaseEntity } from '../base.entity';
@Entity()
export class AlgorithmIntegral extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user: User;

  @Column()
  semester: string;

  @Column()
  compititionName: string;

  @Column()
  integral: number;
}