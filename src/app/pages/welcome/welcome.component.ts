import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppSettingsService, BasketService, ModernConnectorService, RecommendationsService } from '../../services';
import { PeripheralsSelfCheckService, PosServingLocation, DotPage, DotBannersLoader } from 'dotsdk';
import { Subject } from 'rxjs';

@Component({
  selector: 'cod-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  public deviceType: string;
  public variationID: string;
  public promotionType: string;
  public currentPage: DotPage;

  private modernConnecterData;
  private modernConnecterOrder;
  private screens;
  public metaData;
  public items;
  public newData;
  public carSensor: boolean;
  public orderData;
  private timeoutHandler;
  private newTimeOutHandler;

  messages: Subject<any>;

  @Input() public language: string;
  @Output() public serviceTypeSelected: EventEmitter<PosServingLocation> = new EventEmitter();
  private peripheralsCheckService = new PeripheralsSelfCheckService();

  constructor(
    private appSettings: AppSettingsService, 
    private basketService: BasketService, 
    private http: HttpClient,
    private router: Router,
    private readonly recommendationsService: RecommendationsService,
    private location: Location,
    private modernConnectorService: ModernConnectorService
    ) { }

  banners = DotBannersLoader.getInstance().loadedModel;
  
  public async ngOnInit() {
    
    this.getMetaData(); // AB Tasty and Car data from QTimer
    this.getUpdatedOrder(); // Order data from the Brain POS

    // As this componented gets initiated each time an Order is closed, reset some values here:
    this.language = this.appSettings.defaultLanguage;
    this.basketService.resetBasket();

    // Enable Background peripherals check:
    this.peripheralsCheckService.startPeripheralsCheck().subscribe(next => {
      // TODO: show proper screen for peripherals error
    });
    
    // this.http.get<any>(`${this.appSettings.modernConnectorFilesPath}/bridge/files`).subscribe(data => {
    //         this.modernConnecterData = data;
    //         // console.log("files", this.modernConnecterData);
    // });
    // this.http.get<any>(`${this.appSettings.modernConnectorFilesPath}/bridge/products`).subscribe(data => {
    //         this.modernConnecterData = data;
    //         // console.log("products", this.modernConnecterData);
    // });
    // this.http.get<any>(`${this.appSettings.modernConnectorFilesPath}/screens`).subscribe(data => {
    //         this.screens = JSON.stringify(data);
    //         // console.log("screens", this.screens);
    // });
    // this.http.get<any>(`${this.appSettings.modernConnectorFilesPath}/arise/orders`).subscribe(data => {
    //         this.modernConnecterOrder = data;
    //         // console.log("orders", this.modernConnecterOrder);
    // });
    // this.newData = await this.http.get<any>(`${this.appSettings.modernConnectorFilesPath}/devices/LANE1/COD1`).subscribe(data => {
    //   this.metaData = JSON.stringify(data);
    //   // console.log("New Modern Connector", data);
    //   return this.metaData;
    // });
  }

  @HostListener('window:beforeunload')
  public async ngOnDestroy() {
    if(this.orderData){
      this.orderData.unsubscribe();
    }
    if (this.timeoutHandler || this.newTimeOutHandler) {
      clearTimeout(this.timeoutHandler);
      clearTimeout(this.newTimeOutHandler);
    }
  }

  public getMetaData() {
    this.modernConnectorService.listen('metadataUpdated').subscribe((res) => {
      console.log("MetaData",res);
      this.carSensor = true;
      this.goToNextPage();
    });
  }

  public getUpdatedOrder(){
    this.orderData = this.modernConnectorService.listen('updateOrder').subscribe((data) => {
      console.log("updateOrder", data);
      if (data == null) return;
      this.carSensor = true;
      this.goToNextPage();      
    });
  }

  public goToNextPage() {
    this.recommendationsService.updatePopulars().catch(console.error);
    
    // if (this.items && this.items.length > 0){   
    if (this.carSensor === true){   
      this.router.navigate(['orderarea'], { skipLocationChange: true });
      this.location.replaceState('orderarea');
    }
    
  }

}
