import { Component, ViewChild, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppSettingsService, ContentService, ModernConnectorService, RecommendationsService } from '../../services';
import { DotPage } from 'dotsdk';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    templateUrl: './confirm-order.component.html',
    styleUrls: ['./confirm-order.component.scss']
})
export class ConfirmOrderComponent implements OnInit, OnDestroy   {

    public currentPage: DotPage;
    public items;
    public bgPath: string;
    public logoPath: string;
    public carImg: string;
    public length: boolean;
    private timeoutHandler;
    private updateConfirmOrder;
    public ordersData;
    public carLeftTrigger;
    public carPresence;

    @ViewChild('itemsContainer', {static: false}) private _itemsContainer: ElementRef<HTMLElement>;
    @ViewChild('orderList', {static: false}) private myScrollContainer: ElementRef;

    constructor(private contentService: ContentService,
        private appSettings: AppSettingsService,
        private router: Router,
        private location: Location,
        private modernConnectorService: ModernConnectorService,
        private readonly recommendationsService: RecommendationsService) {            
            this.bgPath = `${this.appSettings.acreBridgeAssets}/Items/image_2020_03_23T00_34_07_380Z.png`;
            this.logoPath = `${this.appSettings.acreBridgeAssets}/Items/Image_1.png`;
            this.carImg = `${this.appSettings.acreBridgeAssets}/Items/Gif-Car-1.1.gif`;
    }

    @HostListener('window:beforeunload')
    public async ngOnDestroy() {
        // if (this.timeoutHandler) {            
        //     window.clearTimeout(this.timeoutHandler);
        // }
        if(this.updateConfirmOrder){
            this.updateConfirmOrder.unsubscribe();
        }   
    }
    
    public ngOnInit() {
        this.currentPage = this.contentService.mainPage;
        this.length = true;
        this.confirmOrder();
        this.carStatus();
        this.scrollToBottom();  
    }

    public confirmOrder(){
        this.updateConfirmOrder = this.modernConnectorService.listen('updateOrder').subscribe((data) => {
            console.log("Confirm Order: ", data);
            if (data == null) return;
            this.ordersData = data;            
            this.items = this.ordersData && this.ordersData.items;
            const noOfItems = this.items.length;            
            this.length = (noOfItems < 8) ? true: false;
        });
    }
    public carStatus() {
        this.carLeftTrigger = this.modernConnectorService.listen('metadataUpdated').subscribe((res) => {            
            this.carPresence = res;
            const carSensorState = this.carPresence;
            if (carSensorState.name === "sensorState"){
                if(!carSensorState.value){
                    console.log("Car Left COD");
                    this.goToOrderArea();
                    this.timeoutHandler = setTimeout(() => {
                        this.goToWelcome();
                    }, 10000);
                }
            }            
        });
    }
    
    public ngAfterViewChecked() { 
        this.scrollToBottom(); 
    } 
  
    public ngAfterViewInit() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch(err) { }                 
    }

    goToOrderArea() {
        this.recommendationsService.updatePopulars().catch(console.error);
        this.router.navigate(['orderarea'], { skipLocationChange: true });
        this.location.replaceState('orderarea');
    }

    goToWelcome() {
        this.recommendationsService.updatePopulars().catch(console.error);
        this.router.navigate(['welcome'], {skipLocationChange: true});
        this.location.replaceState('welcome');
    }    
}
