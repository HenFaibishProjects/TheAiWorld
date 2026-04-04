import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class VectorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({
    type: 'vector',
    length: 3072,
  })
  embedding: number[];
}