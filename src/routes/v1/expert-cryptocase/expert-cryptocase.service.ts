import { forwardRef, Inject, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import * as lodash from 'lodash';
import { MyLogger } from '@shared/logger/logger.service';
import { CryptocoinsService } from '@v1/cryptocoins/cryptocoins.service';
import UsersEntity from '@v1/users/entities/user.entity';
import { UsersService } from '@v1/users/users.service';
import { CreateExpertCryptocaseDto } from './dto/create-expert-cryptocase.dto';
import { UpdateExpertCryptocaseDto } from './dto/update-expert-cryptocase.dto';
import { CryptoWeightRepository } from './repositories/crypto-weight.repository';
import { ExpertCryptocaseRepository } from './repositories/expert-cryptocases.repository';
import { ExpertCryptocase } from './entities/expert-cryptocase.entity';
import { CryptoWeightState, CryptocaseType, WeightingScheme, DomainType, VolatilityType, SortOrder, SortOrderType, Platform } from '@config/constants';
import { Cryptocoin } from '@v1/cryptocoins/entities/cryptocoin.entity';
import { CryptoWeight } from './entities/crypto-weight.entity';
import mongoose, { Types } from 'mongoose';
import { AddCryptoWeightDto } from './dto/add-crypto-weight.dto';
import { PaginationParamsInterface } from '@interfaces/pagination-params.interface';
import { PaginatedExpertCryptocaseInterface } from '@interfaces/paginated-users.interface';
import { UpdateCryptoWeightDto } from './dto/update-crypto-weight.dto';
import { RolesEnum } from '@decorators/roles.decorator';
import { ExchangeService } from '@v1/exchange/exchange.service';
import { Type } from 'class-transformer';
import { UpdateCryptoWeightsDto } from './dto/update-crypto-weights.dto';
import { UpdateCryptocaseWithCryptoWeightDto } from './dto/update-cryptocase-with-cryptoweight.dto';
import { CurrentPrice } from '@v1/exchange/entities/current-price.entity';
// import { UpdateCryptoWeightDto } from './dto/update-crypto-Weight.dto';


@Injectable()
export class ExpertCryptocasesService {
  constructor(private readonly expertCryptocaseRepository: ExpertCryptocaseRepository,
    private readonly cryptoWeightRepository: CryptoWeightRepository,
    private readonly usersService: UsersService,
    private readonly cryptoCoinService: CryptocoinsService,
    @Inject(forwardRef(() => ExchangeService))
    private readonly exchangeService: ExchangeService,
    private logger: MyLogger
  ) { this.logger.setContext(ExpertCryptocasesService.name) }


  async createCryptocaseByExpert(createExpertCryptocaseDto: CreateExpertCryptocaseDto) {
    try {
      
      // check the expert details  from db
      const expertData: UsersEntity = await this.usersService.getVerifiedUserById(new Types.ObjectId(createExpertCryptocaseDto.expertId));
      // Throw error if not found
      if (lodash.isEmpty(expertData)) {
        throw new NotFoundException(`No verified expert found with id ${createExpertCryptocaseDto.expertId}`)
      }
      const cryptocaseType = (expertData.role === RolesEnum.USER) ? CryptocaseType.PRIVATE : CryptocaseType.PUBLIC;
      // create new cryptoexpertCryptocase object
      let newExpertCryptocaseObject = {
        expertId: new Types.ObjectId(createExpertCryptocaseDto.expertId),
        name: createExpertCryptocaseDto.name,
        domain: createExpertCryptocaseDto.domain,
        volatility: (createExpertCryptocaseDto.volatility || VolatilityType.HIGH),// need to fix this volatility part
        tags: createExpertCryptocaseDto.tags,
        pricing: createExpertCryptocaseDto.pricing,
        exchange: createExpertCryptocaseDto.exchange,
        description: createExpertCryptocaseDto.description,
        quoteSymbol: createExpertCryptocaseDto.quoteSymbol,
        weightingScheme: (createExpertCryptocaseDto.weightingScheme || WeightingScheme.EQUI_WEIGHTED),
        cryptoWeightageList: [],
        caseType: cryptocaseType,
        imageUrl: createExpertCryptocaseDto.imageUrl,
        subtitle: createExpertCryptocaseDto.subtitle,
        
      }
      const newExpertCryptocase = await this.expertCryptocaseRepository.create(newExpertCryptocaseObject);
      this.logger.log("Successfully created a Cryptocase with id ", newExpertCryptocase._id)

      // fetch the cryptocoin data of id's which is in Cryptocase list
      let cryptoCoinList: Cryptocoin[] = await this.cryptoCoinService.findAllCryptoCoinByIds(createExpertCryptocaseDto.cryptoCurrencyIdList);
      // throw error if not found cryptocoin
      if (lodash.isEmpty(cryptoCoinList)) {
        throw new NotFoundException(`Not found cryptocoins with ids ${createExpertCryptocaseDto.cryptoCurrencyIdList}`)
      }
      this.logger.log("Success fully found cryptocoins ", cryptoCoinList.length)
      // check for length distribute each Cryptocase in equi percent
      const initialWeightage: number = this.getInitialWeightPercentage(cryptoCoinList.length)
      // create array of create cryptoWeight and create list of crypto Weight out of each crypto coin
      let newCryptoWeightsIdList: Types.ObjectId[] = []
      // check how to pass cryptoWeight type
      try {
        newCryptoWeightsIdList = await Promise.all(cryptoCoinList.map(async (cryptocoin) => {

          // getting current price of the symbol from binance currently but need to enhance and take the param from ui
          const coinPairSymbol = cryptocoin.symbol + createExpertCryptocaseDto.quoteSymbol;
          const symbolCurrentPrice = await this.exchangeService.getSymbolCurrentPrice(Platform.BINANCE, coinPairSymbol);
          const exchangeInfo = await this.exchangeService.getExchangeInfo(Platform.BINANCE, coinPairSymbol);
          console.log(exchangeInfo.symbols[0]);
          // creating new instance of cryptocoin
          let newCryptoWeight: CryptoWeight = {
            cryptocaseId: newExpertCryptocase._id,
            cryptoCoin: cryptocoin,
            currentPercentage: initialWeightage,
            lastPercentage: initialWeightage,
            coinState: CryptoWeightState.UNLOCKED,
            initiallyAddedPrice: symbolCurrentPrice.price,
            minQty: exchangeInfo.symbols[0].filters[2].minQty,
            minPrice: exchangeInfo.symbols[0].filters[0].minPrice,
            // maxPrice: exchangeInfo.symbols[0].filters[0].maxPrice
          }
          // save in mongo db each crypto Weight and push on cryptoWeight array
          // const newCryptoCoin = await this.cryptoWeightRepository.create(newCryptoWeight)
          // newCryptoWeightList.push(newCryptoCoin);
          // newCryptoWeight._id = newCryptoWeight._id.toString()

          const cryptoWeight: CryptoWeight = await this.cryptoWeightRepository.create(newCryptoWeight);
          return cryptoWeight._id;
        }));
      } catch (error) {
        // this.logger.error(`Unexpected error occurred while creating crypto Weight in createCryptoCryptocaseByExpert due to ${error.message}`)
        throw new InternalServerErrorException(`Unexpected error occurred while creating crypto Weight in createCryptoCryptocaseByExpert due to ${error.message}`);
      }
      // update expertCryptocase data with weightageCryptoWeight array
      // newExpertCryptoCryptocaseObject.cryptoWeightageList = [...newCryptoWeights];
      let updatedCryptocase = await this.expertCryptocaseRepository.updateCryptoWeightInCryptocaseById(newExpertCryptocase._id, newCryptoWeightsIdList);

      this.logger.log("Successfully updated the Cryptocase", updatedCryptocase);
      return updatedCryptocase;
    } catch (error) {
      // this.logger.error(`Unexpected error occurred while creating new expertPortifolio due to ${error.message}`)
      throw new InternalServerErrorException(`Unexpected error occurred while creating new expertPortifolio due to ${error.message}`);
    }
  }

  getInitialWeightPercentage(weightage: number) {
    return 100 / weightage;
  }

  async findAllCryptocasesByExpert(expertId: string, options: PaginationParamsInterface): Promise<PaginatedExpertCryptocaseInterface> {
    return await this.expertCryptocaseRepository.getCryptocaseByExpertId(expertId, options)
  }
  async findAllCryptocases(options: PaginationParamsInterface): Promise<PaginatedExpertCryptocaseInterface> {
    return await this.expertCryptocaseRepository.getAllCryptoCryptocases(options)
  }

  async findCryptocaseById(id: Types.ObjectId) {
    const cryptocase: ExpertCryptocase = await this.expertCryptocaseRepository.getById(id);
    let cryptoWeightageList = cryptocase.cryptoWeightageList as CryptoWeight[];
    cryptoWeightageList = await Promise.all(cryptoWeightageList.map(async (cryptoWeight) => {
      cryptoWeight.overallPerformance = await this.getTillDatePerformance(cryptoWeight.cryptoCoin.symbol + cryptocase.quoteSymbol, cryptoWeight.initiallyAddedPrice);
      return cryptoWeight;
    }));
    cryptocase.cryptoWeightageList = cryptoWeightageList;
    return cryptocase;
    // cryptocase.cryptoWeightageList.map(async (cryptoWeight)=>{
    //   cryptoWeight.overallPerformance = await this.getTillDatePerformance(cryptocase.quoteSymbol+cryptoWeight.cryptocoin.symbol,cryptoWeight.initiallyAddedPrice);
    // })
    // console.log(cryptocase.cryptoWeightageList);
    // return cryptocase;
  }


  async getTillDatePerformance(symbol: string, price:number )
  {
    const currentPrice = await this.exchangeService.getSymbolCurrentPrice('binance', symbol) as CurrentPrice;
    return ((currentPrice.price - price)/price)*100;
  }

  // Crypto Weight
  async createCryptoCoinWeight(cryptoWeightdto: AddCryptoWeightDto) {
    try {
      //check if expert exist
      let expertUser: UsersEntity = (await this.usersService.getVerifiedUserById(new Types.ObjectId(cryptoWeightdto.expertId)) || null)
      if (lodash.isEmpty(expertUser)) {
        // this.logger.debug(`Unable to find expert user to add crypto Weight ${expertUser}`)
        throw new NotFoundException(`Unable to find expert user to add crypto Weight with id ${cryptoWeightdto.expertId}`);
      }

      //check if Cryptocase exist
      let cryptocaseByExpert: ExpertCryptocase = await this.expertCryptocaseRepository.getById(new Types.ObjectId(cryptoWeightdto.cryptocaseId));
      if (lodash.isEmpty(cryptocaseByExpert)) {
        // this.logger.debug(`Unable to find prtfolio to add crypto Weight ${cryptoCryptocaseByExpert}`)
        throw new NotFoundException(`Unable to find Cryptocase to add add crypto Weight with id ${cryptoWeightdto.cryptocaseId}`);
      }
      // check if Weight list already full with the max size of crypto Weights
      // const cryptoWeightageList = await this.cryptoWeightRepository.getAllCryptoWeightsWithCaseId(cryptocaseByExpert._id);
      const cryptoWeightageList: CryptoWeight[] = cryptocaseByExpert.cryptoWeightageList as CryptoWeight[];
      const Weight_LIST_SIZE = 10;
      if (lodash.isEmpty(cryptoWeightageList) && cryptoWeightageList.length >= Weight_LIST_SIZE) {
        throw new NotAcceptableException(`Unable to add Weight. You can add only ${Weight_LIST_SIZE} Crypto Weights.`);
      }
      // get Crypto Currency from Id
      let cryptoCoinObject: Cryptocoin = await this.cryptoCoinService.findCryptoCoinById(new Types.ObjectId(cryptoWeightdto.cryptoCoinId));
      if (lodash.isEmpty(cryptoCoinObject)) {
        // this.logger.debug(`Unable to find prtfolio to add crypto Weight ${cryptoCryptocaseByExpert}`)
        throw new NotFoundException(`Unable to find crypto coinwith id ${cryptoWeightdto.cryptoCoinId}`);
      }

      // check if Weight already added
      this.logger.debug(`cryptoWeight`, lodash.findIndex(cryptoWeightageList, { "cryptoCoin": cryptoCoinObject }))
      if (lodash.findIndex(cryptoWeightageList, { "cryptoCoin": cryptoCoinObject }) > 0) {
        throw new NotAcceptableException(`Weight already exist in Cryptocase try to add another one. ${JSON.stringify(cryptoWeightageList)} where ${cryptoCoinObject.symbol}`);
      }
      let newCryptoWeight: CryptoWeight;
      // Try to updating the weightage of cryptostcok if its equiweight 
      if (lodash.isEqualWith(cryptocaseByExpert.weightingScheme, WeightingScheme.EQUI_WEIGHTED)) {
        try {
          const newPercentageWeight = this.getInitialWeightPercentage(cryptoWeightageList.length + 1);

          // get cryptocoin pair current price
          const coinPairSymbol = cryptoCoinObject.symbol+cryptocaseByExpert.quoteSymbol;
          const symbolCurrentPrice = await this.exchangeService.getSymbolCurrentPrice('binance', coinPairSymbol) as CurrentPrice;
          const exchangeInfo = await this.exchangeService.getExchangeInfo('binance', coinPairSymbol);
          newCryptoWeight = {
            cryptocaseId: new Types.ObjectId(cryptocaseByExpert._id),
            cryptoCoin: cryptoCoinObject,
            currentPercentage: newPercentageWeight,
            lastPercentage: newPercentageWeight,
            coinState: CryptoWeightState.UNLOCKED,
            initiallyAddedPrice: symbolCurrentPrice.price,
            minQty: exchangeInfo.symbols[0].filters[2].minQty,
            minPrice: exchangeInfo.symbols[0].filters[0].minPrice,
          }
          newCryptoWeight = await this.cryptoWeightRepository.create(newCryptoWeight);

          // updating Cryptocase with new cryptoWeight
          // cryptocaseByExpert.cryptoWeightageList.push(newCryptoWeight)
          cryptoWeightageList.push(newCryptoWeight);
          // cryptocaseByExpert.cryptoWeightageList.forEach(cryptoWeight => {
          //   cryptoWeight.currentPercentage = newPercentageWeight;
          //   cryptoWeight.lastPercentage = cryptoWeight.currentPercentage;
          // });

          cryptoWeightageList.forEach(async (cryptoWeight: CryptoWeight) => {
            await this.cryptoWeightRepository.updateCryptoWeightById(cryptoWeight._id, {
              currentPercentage: newPercentageWeight,
              lastPercentage: newPercentageWeight
            })
          })

          //Updating Cryptocase
          await this.expertCryptocaseRepository.updateCryptoWeightInCryptocaseById(cryptocaseByExpert._id, cryptocaseByExpert.cryptoWeightageList.map((cryptoWeight) => cryptoWeight._id));
        } catch (error) {
          throw new InternalServerErrorException(`Unexpected error occurred while adding crypto Weight to expertPortifolio in EQUI_WEIGHTED scheme due to ${error.message}`);
        }
      } else {
        // logic for not equiweighted
        // fetch all cryptoWeight with locked state from Cryptocase
        // sum totallockpercentage of cryptoWeights in Cryptocase
        let totalLockedWeightPercentage: number = 0;
        let totalLockedWeights: number = 0;
        // const cryptoWeights = cryptoCryptocaseByExpert.cryptoWeightageList;
        cryptoWeightageList.forEach((element: CryptoWeight) => {
          if (element.coinState === CryptoWeightState.LOCKED) {
            totalLockedWeightPercentage = totalLockedWeightPercentage + element.currentPercentage
            totalLockedWeights = totalLockedWeights + 1;
          }
        });
        // get cryptocoin pair current price
        const coinPairSymbol = cryptoCoinObject.symbol+cryptocaseByExpert.quoteSymbol;
        const symbolCurrentPrice = await this.exchangeService.getSymbolCurrentPrice('binance', coinPairSymbol) as CurrentPrice;
        const exchangeInfo = await this.exchangeService.getExchangeInfo('binance', coinPairSymbol);
        // console.log('this is the exchange info object', exchangeInfo)
        newCryptoWeight = {
          cryptocaseId: new Types.ObjectId(cryptocaseByExpert._id),
          cryptoCoin: cryptoCoinObject,
          currentPercentage: 1,
          lastPercentage: 1,
          coinState: CryptoWeightState.UNLOCKED,
          initiallyAddedPrice: symbolCurrentPrice.price,
          minQty: exchangeInfo.symbols[0].filters[2].minQty,
          minPrice: exchangeInfo.symbols[0].filters[0].minPrice,
        }
        newCryptoWeight = await this.cryptoWeightRepository.create(newCryptoWeight);

        cryptoWeightageList.push(newCryptoWeight);
        const newPercentageWeight: number = (100 - totalLockedWeightPercentage) / (cryptoWeightageList.length - totalLockedWeights)
        // iterate through cryptoWeights of Cryptocase
        // if cryptoWeight is unlocked
        // calculate current % by getCustomWeightPercentage
        // subtract from current% of crypto Weight and update in Cryptocase
        cryptoWeightageList.forEach(async (cryptoWeightel: CryptoWeight) => {
          if (cryptoWeightel.coinState === CryptoWeightState.UNLOCKED) {
            // const currentCryptoWeightPercentage = cryptoWeightel.currentPercentage - this.getCustomWeightPercentage(cryptoWeightel.currentPercentage, totalLockedWeightPercentage + 1) // giving new addedWeight percenatge as 1
            cryptoWeightel.lastPercentage = cryptoWeightel.currentPercentage;
            cryptoWeightel.currentPercentage = newPercentageWeight;

            await this.cryptoWeightRepository.updateCryptoWeightById(cryptoWeightel._id, cryptoWeightel);
          }
        });

        //Updating Cryptocase
        await this.expertCryptocaseRepository.updateCryptoWeightInCryptocaseById(cryptocaseByExpert._id, cryptocaseByExpert.cryptoWeightageList.map((cryptoWeight) => cryptoWeight._id));
      }
      return newCryptoWeight
    } catch (error) {
      throw new InternalServerErrorException(`Unexpected error occurred while adding crypto Weight to expertPortifolio due to ${error.message}`);
    }
  }

  getCustomWeightPercentage(totalCryptoUnlockedWeight: number, totallockpercentage: number) {
    const remainingPercentage: number = 100 - totallockpercentage;
    return remainingPercentage / totalCryptoUnlockedWeight;
  }

  async findCryptoCoinWeightById(id: Types.ObjectId) {
    const cryptoWeight: CryptoWeight = await this.cryptoWeightRepository.getById(id);
    const cryptocase = await this.findCryptocaseById(cryptoWeight.cryptocaseId);
    const quoteSymbol = cryptocase.quoteSymbol;
    cryptoWeight.overallPerformance = await this.getTillDatePerformance(cryptoWeight.cryptoCoin.symbol + quoteSymbol, cryptoWeight.initiallyAddedPrice)
    return cryptoWeight;
  }

  // Update Only Weight percentage
  async updateCryptoCoinWeightPercentage(id: Types.ObjectId, updateCryptoWeightDto: UpdateCryptoWeightDto) {
    try {
      //check if Cryptocase exist
      let cryptocaseByExpert: ExpertCryptocase = await this.expertCryptocaseRepository.getById(new Types.ObjectId(updateCryptoWeightDto.cryptocaseId));
      if (lodash.isEmpty(cryptocaseByExpert)) {
        // this.logger.debug(`Unable to find prtfolio to add crypto Weight ${cryptocaseByExpert}`)
        throw new NotFoundException(`Unable to find Cryptocase to add add crypto Weight with id ${updateCryptoWeightDto.cryptocaseId}`);
      }

      // get CryptoWeight from Id
      let cryptoWeight: CryptoWeight = await this.cryptoWeightRepository.getById(new Types.ObjectId(id));
      if (lodash.isEmpty(cryptoWeight)) {
        // this.logger.debug(`Unable to find prtfolio to add crypto Weight ${cryptocaseByExpert}`)
        throw new NotFoundException(`Unable to find cryptoWeight with id ${id}`);
      }

      if (updateCryptoWeightDto.percentage > 100) {
        throw new NotAcceptableException(`Pls try to pass accurate percentage for cryptoWeight which is less than 100%, passed value is: ${updateCryptoWeightDto.percentage}`);
      }

      // let cryptoWeightageList = await this.cryptoWeightRepository.getAllCryptoWeightsWithCaseId(cryptoCryptocaseByExpert._id);
      let cryptoWeightageList = cryptocaseByExpert.cryptoWeightageList as CryptoWeight[];
      let totalLockedWeightPercentage: number = 0;
      let totalUnLockedWeightPercentage: number = 0;
      let totalLockedWeights: number = 1;
      cryptoWeightageList.forEach((element: CryptoWeight) => {
        if (element.coinState === CryptoWeightState.LOCKED && !element._id.equals(id)) {
          totalLockedWeightPercentage = totalLockedWeightPercentage + element.currentPercentage
          totalLockedWeights = totalLockedWeights + 1;
        }

        // if (element.coinState === CryptoWeightState.UNLOCKED && !element._id.equals(id)) {
        //   totalUnLockedWeightPercentage = totalUnLockedWeightPercentage + element.currentPercentage
        // }
      });

      // this.logger.debug("percentage value ", totalLockedWeightPercentage, updateCryptoWeightDto.percentage, totalUnLockedWeightPercentage)
      if ((totalLockedWeightPercentage + updateCryptoWeightDto.percentage) > 100) {
        throw new NotAcceptableException(`Pls try to pass overall all sum to cryptoWeight should be less than or equal to 100%, passed value is: ${(totalLockedWeightPercentage + updateCryptoWeightDto.percentage)}`);
      }

      // if it was not unlocked now it will change the state to locked
      // if (cryptoWeight.coinState === CryptoWeightState.UNLOCKED) {
      //   totalLockedWeights = totalLockedWeights + 1;
      // }

      cryptoWeight.lastPercentage = cryptoWeight.currentPercentage;
      cryptoWeight.currentPercentage = updateCryptoWeightDto.percentage;
      cryptoWeight.coinState = CryptoWeightState.LOCKED;
      const updatedCryptoWeight = await this.cryptoWeightRepository.updateCryptoWeightById(new Types.ObjectId(id), cryptoWeight);

      if (cryptocaseByExpert.weightingScheme === WeightingScheme.EQUI_WEIGHTED) {
        await this.expertCryptocaseRepository.updateCryptocaseById(cryptocaseByExpert._id, { weightingScheme: WeightingScheme.CUSTOM_WEIGHTED })
      }
      // updating Cryptocase with new cryptoWeight 
      // enhance it
      totalLockedWeightPercentage = totalLockedWeightPercentage + updatedCryptoWeight.currentPercentage;
      let newPercentageWeight: number = 0;

      this.logger.debug("percentage details", totalLockedWeightPercentage, cryptoWeightageList.length - totalLockedWeights)
      if (totalLockedWeights < cryptoWeightageList.length) {
        newPercentageWeight = (100 - totalLockedWeightPercentage) / (cryptoWeightageList.length - totalLockedWeights)
      }
      cryptoWeightageList.forEach(async (cryptoWeightEl: CryptoWeight) => {
        if (cryptoWeightEl._id.equals(cryptoWeight._id)) {
          cryptoWeightEl.coinState = updatedCryptoWeight.coinState;  // issue 
          cryptoWeightEl.currentPercentage = updatedCryptoWeight.currentPercentage;
          cryptoWeightEl.lastPercentage = updatedCryptoWeight.lastPercentage;
          // this.logger.debug("success fully found cryptoWeight", cryptoWeightEl)
        }

        if (cryptoWeightEl.coinState === CryptoWeightState.UNLOCKED) {
          cryptoWeightEl.lastPercentage = cryptoWeightEl.currentPercentage;
          cryptoWeightEl.currentPercentage = newPercentageWeight;
          await this.cryptoWeightRepository.updateCryptoWeightById(cryptoWeightEl._id, cryptoWeightEl)
        }
      });

      //Updating Cryptocase
      // await this.expertCryptocaseRepository.updateCryptoWeightInCryptocaseById(cryptoCryptocaseByExpert._id, cryptoCryptocaseByExpert.cryptoWeightageList);

      return updatedCryptoWeight;
    } catch (error) {
      throw new InternalServerErrorException(`Unexpected error occurred while updating crypto Weight % to expertPortifolio due to ${error.message}`);
    }
  }


  async updateListOfCryptoWeights(cryptocaseId: string, updateCryptocaseWithCryptoWeightDto: UpdateCryptocaseWithCryptoWeightDto) {
    try {

      // check if cryptocase exist of the provided ID
      const cryptocase = await this.expertCryptocaseRepository.getById(new Types.ObjectId(cryptocaseId));

      if (lodash.isEmpty(cryptocase))
        throw new NotFoundException("No cryptocase found for the provided cryptocase id");


      let sum = 0;
      if (updateCryptocaseWithCryptoWeightDto.weightingScheme === WeightingScheme.CUSTOM_WEIGHTED) {
        updateCryptocaseWithCryptoWeightDto.cryptoWeightageList.forEach((cryptoWeight) => {
          sum += cryptoWeight.percentage;
        });
      }

      if (updateCryptocaseWithCryptoWeightDto.weightingScheme === WeightingScheme.CUSTOM_WEIGHTED && Math.round(sum) !== 100)
        throw new NotAcceptableException("sum of percentage of cryptoweights not equal to 100");

      const cryptoWeightageList = await Promise.all(updateCryptocaseWithCryptoWeightDto.cryptoWeightageList.map(async (cryptoWeight: UpdateCryptoWeightsDto) => {

        if (!cryptoWeight._id) {

          const cryptoCoin = await this.cryptoCoinService.findCryptoCoinById(new Types.ObjectId(cryptoWeight.cryptoCoinId));
          if (lodash.isEmpty(cryptoCoin))
            throw new NotFoundException("No cryptocoin found of the provided cryptoCoinId");

          const coinPairSymbol = cryptoCoin.symbol + cryptocase.quoteSymbol;
          const symbolCurrentPrice = await this.exchangeService.getSymbolCurrentPrice('binance', coinPairSymbol);
          if (lodash.isEmpty(symbolCurrentPrice.price))
            throw new NotFoundException("Unable to find symbol price due to unsupported coin pair. Please try different crypto coin.");

          const exchangeInfo = await this.exchangeService.getExchangeInfo('binance', coinPairSymbol);

          return {
            cryptoCoin,
            cryptocaseId: new Types.ObjectId(cryptocaseId),
            currentPercentage: (updateCryptocaseWithCryptoWeightDto.weightingScheme === WeightingScheme.EQUI_WEIGHTED) ? (100 / updateCryptocaseWithCryptoWeightDto.cryptoWeightageList.length) : cryptoWeight.percentage,
            lastPercentage: (updateCryptocaseWithCryptoWeightDto.weightingScheme === WeightingScheme.EQUI_WEIGHTED) ? (100 / updateCryptocaseWithCryptoWeightDto.cryptoWeightageList.length) : cryptoWeight.percentage,
            coinState: (updateCryptocaseWithCryptoWeightDto.weightingScheme === WeightingScheme.EQUI_WEIGHTED) ? CryptoWeightState.UNLOCKED : cryptoWeight.coinState,
            initiallyAddedPrice: symbolCurrentPrice.price,
            minQty: exchangeInfo.symbols[0].filters[2].minQty,
            minPrice: exchangeInfo.symbols[0].filters[0].minPrice,
          } as CryptoWeight
        } else
          return cryptoWeight;
      })
    )


      const updatedCryptoWeightageIdList = await Promise.all(cryptoWeightageList.map(async (cryptoweight: UpdateCryptoWeightsDto & CryptoWeight) => {
        if (cryptoweight.changed && cryptoweight._id) {
          const cryptoWeightel: CryptoWeight = await this.cryptoWeightRepository.getById(new Types.ObjectId(cryptoweight._id));
          cryptoWeightel.coinState = cryptoweight.coinState;
          // if current percentage is same as cryptoweightdto percentage then no need to update 
          if (cryptoweight.percentage !== cryptoWeightel.currentPercentage) {
            cryptoWeightel.lastPercentage = cryptoWeightel.currentPercentage;
            cryptoWeightel.currentPercentage = cryptoweight.percentage;
          }

          await this.cryptoWeightRepository.updateCryptoWeightById(cryptoWeightel._id, cryptoWeightel);
        } else if (!cryptoweight._id) {

          let newCryptoWeight = await this.cryptoWeightRepository.create(cryptoweight) as CryptoWeight;
          return newCryptoWeight._id;
        }

        return new Types.ObjectId(cryptoweight._id);
      }));
      const { name, description, volatility, tags, exchange, weightingScheme, pricing, domain } = updateCryptocaseWithCryptoWeightDto as CreateExpertCryptocaseDto
      const updatedCryptocase = { name, description, volatility, tags, exchange, weightingScheme, pricing, domain, cryptoWeightageList: updatedCryptoWeightageIdList };
      return this.expertCryptocaseRepository.updateCryptocaseById(new Types.ObjectId(cryptocaseId), updatedCryptocase);
    } catch (error) {
      throw new InternalServerErrorException(`Unexpected error occurred while updating expert cryptocase due to ${error.message}`);
    }
  }

  // /**
  //  * 
  //  * @param id id of the cryptoWeight which needs to be updated
  //  * @param updateCryptoWeightDto 
  //  */
  // async updateCryptoWeightPercentage(id:Types.ObjectId, updateCryptoWeightDto: UpdateCryptoWeightDto){
  //   let cryptoWeight: CryptoWeight = await this.cryptoWeightRepository.getById(new Types.ObjectId(id));
  //   if (lodash.isEmpty(cryptoWeight)) {
  //     this.logger.debug(`Unable to find cryptoWeight with id ${id}`)
  //     throw new NotFoundException(`Unable to find cryptoWeight with id ${id}`);
  //   }
  //   let cryptocase = await this.expertCryptocaseRepository.getById(cryptoWeight.cryptocaseId) as ExpertCryptocase;
  //   if(lodash.isEmpty(cryptocase))
  //     throw new NotFoundException(`unable to find Cryptocase of the cryptocase of id ${id.toString()}`);

  //   if (updateCryptoWeightDto.percentage > 100) {
  //     throw new NotAcceptableException(`Pls try to pass accurate percentage for cryptoWeight which is less than 100%, passed value is: ${updateCryptoWeightDto.percentage}`);
  //   }
  //   // get the list of cryptoWeights from the caseId 
  //   let cryptoWeightageList = await this.cryptoWeightRepository.getAllCryptoWeightsWithCaseId(cryptocase._id);

  //   let totalLockedWeightPercentage: number = 0;
  //   let totalUnLockedWeightPercentage: number = 0;
  //   let totalLockedWeights: number = 1;
  //   cryptoWeightageList.forEach((element: CryptoWeight) => {
  //     if (element.coinState === CryptoWeightState.LOCKED && !element._id.equals(id)) {
  //       totalLockedWeightPercentage = totalLockedWeightPercentage + element.currentPercentage
  //       totalLockedWeights = totalLockedWeights + 1;
  //     }

  //     // if (element.coinState === CryptoWeightState.UNLOCKED && !element._id.equals(id)) {
  //     //   totalUnLockedWeightPercentage = totalUnLockedWeightPercentage + element.currentPercentage
  //     // }
  //   });

  //     // this.logger.debug("percentage value ", totalLockedWeightPercentage, updateCryptoWeightDto.percentage, totalUnLockedWeightPercentage)
  //     if ((totalLockedWeightPercentage + updateCryptoWeightDto.percentage) > 100) {
  //       throw new NotAcceptableException(`Pls try to pass overall all sum to cryptoWeight should be less than or equal to 100%, passed value is: ${(totalLockedWeightPercentage + updateCryptoWeightDto.percentage)}`);
  //     }

  //     // if it was not unlocked now it will change the state to locked
  //     // if (cryptoWeight.coinState === CryptoWeightState.UNLOCKED) {
  //     //   totalLockedWeights = totalLockedWeights + 1;
  //     // }

  //     cryptoWeight.lastPercentage = cryptoWeight.currentPercentage;
  //     cryptoWeight.currentPercentage = updateCryptoWeightDto.percentage;
  //     cryptoWeight.coinState = CryptoWeightState.LOCKED;
  //     const updatedCryptoWeight = await this.cryptoWeightRepository.updateCryptoWeightById(new Types.ObjectId(id), cryptoWeight);

  //     if (cryptocase.weightingScheme === WeightingScheme.EQUI_WEIGHTED) {
  //       await this.expertCryptocaseRepository.updateCryptocaseById(cryptocase._id, { weightingScheme: WeightingScheme.CUSTOM_WEIGHTED })
  //     }
  //     // updating Cryptocase with new cryptoWeight 
  //     // enhance it
  //     totalLockedWeightPercentage = totalLockedWeightPercentage + updatedCryptoWeight.currentPercentage;
  //     let newPercentageWeight: number = 0;

  //     this.logger.debug("percentage details", totalLockedWeightPercentage, cryptoWeightageList.length - totalLockedWeights)
  //     if (totalLockedWeights < cryptoWeightageList.length) {
  //       newPercentageWeight = (100 - totalLockedWeightPercentage) / (cryptoWeightageList.length - totalLockedWeights)
  //     }
  //     cryptoWeightageList.forEach(async (cryptoWeightEl: CryptoWeight) => {
  //       if (cryptoWeightEl._id.equals(cryptoWeight._id)) {
  //         cryptoWeightEl.coinState = updatedCryptoWeight.coinState;  // can be hard coded with locked -- issue
  //         cryptoWeightEl.currentPercentage = updatedCryptoWeight.currentPercentage;
  //         cryptoWeightEl.lastPercentage = updatedCryptoWeight.lastPercentage;
  //         // this.logger.debug("success fully found cryptoWeight", cryptoWeightEl)
  //       }

  //       if (cryptoWeightEl.coinState === CryptoWeightState.UNLOCKED) {
  //         cryptoWeightEl.lastPercentage = cryptoWeightEl.currentPercentage;
  //         cryptoWeightEl.currentPercentage = newPercentageWeight;
  //         await this.cryptoWeightRepository.updateCryptoWeightById(cryptoWeightEl._id, cryptoWeightEl)
  //       }
  //     });

  //     //Updating Cryptocase
  //     // await this.expertCryptocaseRepository.updateCryptoWeightInCryptocaseById(cryptocaseByExpert._id, cryptoCryptocaseByExpert.cryptoWeightageList);

  //     return updatedCryptoWeight;

  // }

  async updateCryptoCoinWeightState(id: string, updateCryptoWeightDto: UpdateCryptoWeightDto) {
    //check if Cryptocase exist
    let cryptocaseByExpert: ExpertCryptocase = await this.expertCryptocaseRepository.getById(new Types.ObjectId(updateCryptoWeightDto.cryptocaseId));
    if (lodash.isEmpty(cryptocaseByExpert)) {
      // this.logger.debug(`Unable to find prtfolio to add crypto Weight ${cryptoCryptocaseByExpert}`)
      throw new NotFoundException(`Unable to find Cryptocase to add add crypto Weight with id ${updateCryptoWeightDto.cryptocaseId}`);
    }

    // get CryptoWeight from Id
    let cryptoWeight: CryptoWeight = await this.cryptoWeightRepository.getById(new Types.ObjectId(id));
    if (lodash.isEmpty(cryptoWeight)) {
      // this.logger.debug(`Unable to find prtfolio to add crypto Weight ${cryptoCryptocaseByExpert}`)
      throw new NotFoundException(`Unable to find crypto Weight with id ${id}`);
    }
    cryptoWeight.coinState = CryptoWeightState.LOCKED;

    await this.expertCryptocaseRepository.updateCryptocaseById(cryptocaseByExpert._id, { weightingScheme: WeightingScheme.CUSTOM_WEIGHTED })
    // updating Cryptocase with new cryptoWeight 
    // enhance it

    // cryptocaseByExpert.cryptoWeightageList.forEach((cryptoWeightEl: CryptoWeight) => {
    //   if (cryptoWeightEl._id.equals(cryptoWeight._id)) {
    //     cryptoWeightEl.coinState = CryptoWeightState.LOCKED;
    //     // this.logger.debug("success fully found cryptoWeight", cryptoWeightEl)
    //   }
    // });

    const updatedCryptoWeight = await this.cryptoWeightRepository.updateCryptoWeightById(new Types.ObjectId(id), cryptoWeight);
    //Updating Cryptocase
    // await this.expertCryptocaseRepository.updateCryptoWeightInCryptocaseById(cryptocaseByExpert._id, cryptocaseByExpert.cryptoWeightageList);

    return updatedCryptoWeight;
  }

  getAggregation(symbol: string) {
    return this.expertCryptocaseRepository.aggregateTest(symbol);
  }


  async getCryptocasesByQuery(
    name?: string,
    domain?: DomainType,
    volatility?: VolatilityType,
    symbol?: string,
    quoteSymbol?: string,
    isFree?: string,
    options?: PaginationParamsInterface,
    sortByDate?: SortOrderType,
    sortByNoOfCoins?: SortOrderType,
    sortByPricingWeekly?: SortOrderType,
    sortByPricingMonthly?: SortOrderType,
    sortByPricingYearly?: SortOrderType) {

    const filterQuery: any = {};
    const sortQuery: any = {}

    if (name)
      filterQuery.name = { $regex: name, $options: 'i' };

    if (domain)
      filterQuery.domain = domain;

    if (volatility)
      filterQuery.volatility = volatility;

    if (symbol)
      filterQuery.cryptoweights = {
        $elemMatch: {
          'cryptoCoin.symbol': `${symbol}`
        }
      }

    if (quoteSymbol)
      filterQuery.quoteSymbol = quoteSymbol;

    if (isFree !== undefined) {
      if (isFree.trim() === 'true') {
        filterQuery['pricing.free'] = true;
      }

      if (isFree.trim() === 'false')
        filterQuery['pricing.free'] = false;
    }

    if (sortByNoOfCoins) {
      sortQuery.noOfCoins = SortOrder[sortByNoOfCoins]
    }

    if (sortByPricingWeekly)
      sortQuery['pricing.weekly'] = SortOrder[sortByPricingWeekly];
    if (sortByPricingMonthly)
      sortQuery['pricing.monthly'] = SortOrder[sortByPricingMonthly]
    if (sortByPricingYearly)
      sortQuery['pricing.yearly'] = SortOrder[sortByPricingYearly]


    if (sortByDate) {
      sortQuery.createdAt = SortOrder[sortByDate]
    } else
      sortQuery.createdAt = SortOrder['desc'];  // newly added cryptocase by default 

    return await this.expertCryptocaseRepository.getCryptocasesByQuery(filterQuery, sortQuery, options);
  }
}


