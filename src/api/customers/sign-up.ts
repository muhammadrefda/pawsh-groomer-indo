import {body, validationResult} from "express-validator";
import {NextFunction, Request, Response} from "express";
import {BasicUtil, CustomerCreator, LogPrinter, TCustomerSignUpParams} from "pawsh-utils";
import {sqlDb} from "pawsh-mysql-db";
import {TPlatform} from "pawsh-basic-utils";

import {getCustomerResult, pushCouponFirstRequest} from "../../controllers/customers/main";
import {isCustomerSignUpParamValid} from "../../controllers/customers/validation";

