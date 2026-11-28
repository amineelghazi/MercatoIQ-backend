import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  SilverTransfer,
  SilverTransferDocument,
} from '../database/schemas/silver';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(
    @InjectModel(SilverTransfer.name)
    private readonly transferModel: Model<SilverTransferDocument>,
  ) {}

  // Get paginated transfers with optional filters
  async findAll(query: TransferQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.season) {
      filter.season = query.season;
    }
    if (query.competition_id) {
      filter.competition_id = query.competition_id;
    }
    if (query.position) {
      filter.position = query.position;
    }
    if (query.player_id) {
      filter.player_id = query.player_id;
    }
    if (query.club_id) {
      filter.$or = [
        { from_club_id: query.club_id },
        { to_club_id: query.club_id },
      ];
    }
    if (query.name) {
      filter.to_club_name = { $regex: query.name, $options: 'i' };
    }

    const data = await this.transferModel
      .find(filter)
      .sort({ transfer_date: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await this.transferModel.countDocuments(filter).exec();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get one transfer by MongoDB _id
  async findOne(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Transfer #${id} not found`);
    }

    const transfer = await this.transferModel.findById(id).exec();

    if (!transfer) {
      throw new NotFoundException(`Transfer #${id} not found`);
    }

    return transfer;
  }

  // Create a new transfer
  async create(dto: CreateTransferDto) {
    const transfer = new this.transferModel({
      ...dto,
      ingested_at: new Date(),
    });
    return transfer.save();
  }

  // Update a transfer by MongoDB _id
  async update(id: string, dto: UpdateTransferDto) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Transfer #${id} not found`);
    }

    const updated = await this.transferModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Transfer #${id} not found`);
    }

    return updated;
  }

  // Delete a transfer by MongoDB _id
  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Transfer #${id} not found`);
    }

    const deleted = await this.transferModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`Transfer #${id} not found`);
    }

    return { deleted: true, id };
  }
}
