import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../model/data.model'
import { AppSettingsService, ContentService } from '../../services';
import { DotButton, DotPage } from 'dotsdk';
import { PosPropertiesService } from '../../services/pos-properties.service';

enum ScreenTypes {
  Page = 'Page',
  Modifiers = 'Modifiers',
  Promos = 'Promos'
}

@Component({
  selector: 'app-order-area',
  templateUrl: './order-area.component.html',
  styleUrls: ['./order-area.component.scss']
})
export class OrderAreaComponent implements OnInit {

  public currentScreen: ScreenTypes;
  public currentPage: DotPage;
  public user$:Observable<User | null>;
  public currentButton: DotButton;

  @Input() public showBanner: boolean;

  constructor(private appSettings: AppSettingsService,
              private contentService: ContentService,
              private posPropertiesService: PosPropertiesService) { }

  public ngOnInit( ) {
    // Update Elog Service with proper values:
    this.posPropertiesService.posConfig.posHeader.updateWith({
      currentLanguageCode: this.appSettings.languageCode
    });
    this.posPropertiesService.posConfig.posHeader.orderStartTime = new Date();
    
    // Set Local variables:
    this.currentScreen = ScreenTypes.Page;
    this.currentPage = this.contentService.getPageByButtonLink('1');
    // this.currentButton = this.contentService.getButtonByLink('4005');
    // console.log("What this is the button", this.currentButton);
  }

}
