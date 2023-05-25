import {FirebaseInitService} from "../fire.service";
import {Injectable} from "@angular/core";
import {BaseService} from "./baseService";

@Injectable()
export class ConcreteService extends BaseService {
  constructor(private firebaseInitService: FirebaseInitService) {
    super(firebaseInitService);
  }



}
