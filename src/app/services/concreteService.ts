import {FirebaseInitService} from "../fire.service";
import {Injectable} from "@angular/core";
import {BaseService} from "./baseService";

@Injectable()

// if we just use the base service, it won't work, cause the provider needs to be concrete and not abstract
export class ConcreteService extends BaseService {
  constructor(private firebaseInitService: FirebaseInitService) {
    super(firebaseInitService);
  }



}
