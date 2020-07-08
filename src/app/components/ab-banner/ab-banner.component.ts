import { Component, OnInit, Input, HostBinding, OnDestroy, HostListener } from '@angular/core';
import { AppSettingsService, ContentService, ModernConnectorService } from '../../services';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Socket } from 'ngx-socket-io';

import recommendation from '../../../assets/kiosk-shared-mocks/assets/reco.json';

import { trigger, transition, style, animate, stagger, query } from '@angular/animations';

@Component({
    selector: 'app-ab-banner',
    templateUrl: './ab-banner.component.html',
    styleUrls: ['./ab-banner.component.scss'],
    animations: [
        trigger('quantity', [
            transition(':enter', [
                style({ background: '*' }),
                animate('400ms ease-in-out', style({ background: '#ee7700' })),
                animate('400ms ease-in-out', style({ background: '*' }))
            ])
        ]),
        trigger('slide', [
            transition(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('.6s', style({ transform: '*' }))
            ])
        ]),
        trigger('listAnimation', [
            // transition any time the binding value changes
            transition('* => *', [
              query(':enter', [
                style({ opacity: 0, transform: `translateY(100%)` }),
                stagger(100, [
                  animate('1s',
                    style({ opacity: 1, transform: `translateY(0%)` }))
                ])
              ], {optional: true})
            ])
        ])
    ]
})
export class AbBannerComponent implements OnInit, OnDestroy {

    public variation = {};
    isOpen: boolean = true;

    @Input() public showBanner: boolean;
    public orderArea: boolean;
    public items;
    public orderData;
    public orderState;
    public buttons;
    public totalValue: any;
    public updateData;
    public ordersData;
    public timeoutHandler;

    constructor(
        public appSettings: AppSettingsService,
        private contentService: ContentService,
        private socket: Socket,
        private router: Router,
        private location: Location, 
        private modernConnectorService: ModernConnectorService) { }

    
    @HostListener('window:beforeunload')
    public async ngOnDestroy() {
        this.socket.removeListener("updateOrder", this.getUpdatedOrder);
        if(this.updateData){
            this.updateData.unsubscribe();
        }
    }

    public ngOnInit() {

        // default Qtimer banner state
        this.showBanner = true;

        // this.socket.on("updateOrder", this.onUpdateOrder);
        this.getUpdatedOrder();
    }

    public getUpdatedOrder(){
        this.updateData = this.modernConnectorService.listen('updateOrder').subscribe((data) => {
            console.log("OrderList:", data);
            this.ordersData = data;
            if (data == null) return;

            this.orderData = JSON.stringify(data);
            this.totalValue = this.ordersData.TotalValue;
            this.items = this.ordersData && this.ordersData.items;

            // this is the order data coming from the POS
            this.orderState = this.ordersData.OrderState;
            const itemsLength = this.items && this.items.length;

            // this.orderState === '1' : when order is started at POS
            if ((this.orderState === '1') && (itemsLength > 0)) {
                if (this.timeoutHandler) {
                    clearTimeout(this.timeoutHandler);
                }
                this.isOpen = !this.isOpen;
                this.showBanner = false;
                this.orderArea = true;
                this.updateRecommendations();
            } else if (this.orderState === '2') { // this.orderState === '2' : when order is confirmed              
                this.goToConfirmOrder();
                return;
            }
        });
    }

    // In case you want to update the for you section based on the latest item added to the order list everytime
    private updateRecommendations() {
        this.buttons = [];
        if (!(this.items instanceof Array) || this.items.length === 0) {
            return;
        }
        
        let targetItemId = this.items[0].ItemCode;
        
        if (targetItemId === "" || targetItemId === null || targetItemId === undefined) {
            targetItemId = 1001;
        } 
        // const targetItemId = this.items[this.items.length - 1].ItemCode;
        let itemRecommendations = recommendation.Items.find(_ => _.ItemID == targetItemId);
        if (!itemRecommendations) {
            targetItemId = 1001;
            itemRecommendations = recommendation.Items.find(_ => _.ItemID == targetItemId);
        }

        this.buttons = itemRecommendations.Recommendations.map(_ => this.contentService.getButtonByLink(_.Link));
    }

    public get picture(): string {
        return `${this.appSettings.acreBridgeAssets}/Banners/banner_3260c3f1-016a-421f-8048-da4a35bb9459.png`;
    }

    imagePath = `${this.appSettings.acreBridgeAssets}/Items/`;

    @HostBinding('@quantity')
    public get quantity(): number {
        if (!this.items) {
            return 0;
        }
        return this.items.quantity;
    }

    goToConfirmOrder() {
        this.router.navigate(['confirmOrder'], {
            skipLocationChange: true,
            queryParams: { data: this.orderData }
        });
        this.location.replaceState('confirmOrder');
    }

    public trackByItem = (index, item) => {
        return this.items.indexOf(item);
    }
}
