import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { SilverTransfer } from '../database/schemas/silver';
import { TransfersService } from './transfers.service';

describe('TransfersService', () => {
  let service: TransfersService;

  const mockTransfer = {
    _id: '65f000000000000000000001',
    player_id: 342229,
    season: 2024,
    competition_id: 'ES1',
    position: 'Attack',
  };

  const mockTransferModel: any = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue({ ...mockTransfer, ...dto }),
  }));

  mockTransferModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockTransfer]),
  });
  mockTransferModel.countDocuments = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(1),
  });
  mockTransferModel.findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockTransfer),
  });
  mockTransferModel.findByIdAndUpdate = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockTransfer),
  });
  mockTransferModel.findByIdAndDelete = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockTransfer),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: getModelToken(SilverTransfer.name),
          useValue: mockTransferModel,
        },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
  });

  it('should return paginated transfers', async () => {
    const result = await service.findAll({
      page: 1,
      limit: 20,
      season: 2024,
      competition_id: 'ES1',
    });

    expect(mockTransferModel.find).toHaveBeenCalled();
    expect(result.data).toEqual([mockTransfer]);
    expect(result.meta.total).toBe(1);
  });

  it('should find a transfer by id', async () => {
    const transfer = await service.findOne('65f000000000000000000001');
    expect(transfer).toEqual(mockTransfer);
  });

  it('should throw NotFoundException for an invalid ObjectId', async () => {
    await expect(service.findOne('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException if transfer is not found', async () => {
    mockTransferModel.findById.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(service.findOne('65f000000000000000000001')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should create a transfer', async () => {
    const created = await service.create({
      player_id: 342229,
      season: 2024,
      competition_id: 'ES1',
    });
    expect(created.player_id).toBe(342229);
  });

  it('should update a transfer', async () => {
    const updated = await service.update('65f000000000000000000001', {
      transfer_fee_eur: 10000000,
    });
    expect(updated).toEqual(mockTransfer);
  });

  it('should delete a transfer', async () => {
    const res = await service.remove('65f000000000000000000001');
    expect(res).toEqual({
      deleted: true,
      id: '65f000000000000000000001',
    });
  });
});
