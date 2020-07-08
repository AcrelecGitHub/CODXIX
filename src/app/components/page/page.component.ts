import { Component, OnInit, Input } from '@angular/core';
import { DotPage, DotButton } from 'dotsdk';
import { AppSettingsService  } from '../../services';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  @Input() public page: DotPage;
  public isBusy: boolean;

  public data: Array<any>;
  public campaignData;
  public metaData;

  constructor(
    private http: HttpClient,
    private appSettings: AppSettingsService
    ) {
  }

  public async ngOnInit() {   
    this.isBusy = false; 
    this.carBusyFlag();
  }

  // This is to change the template to busy template when Flagship is returning the campaign Flag
  public async carBusyFlag(){
    this.campaignData = await this.http.get<any>(`${this.appSettings.modernConnectorFilesPath}/devices/LANE1/COD1`).subscribe(data => {      
      const metaData = data;
      const campaigns = metaData.metadata.campaigns;
      if (campaigns) {
        for (const campaign of campaigns) {
          const {
            variation: { modifications }
          } = campaign;
          if (modifications.type === "FLAG") {
            const { value } = modifications;
            if (value.enableBigPicture) {
              this.isBusy = true;
            }
          } else {
            this.isBusy = false;
          }
        }
      }
    });
  }

  /**
   * 
   */
  public get pageButtons(): DotButton[] {
    return this.page.Buttons;
  }

  /**
   * 
   * @param button
   */
}
