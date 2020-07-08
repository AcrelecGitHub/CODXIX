import { Component, OnInit, Input } from '@angular/core';
import { AppSettingsService } from '../../services';

import { DotButton } from 'dotsdk';

@Component({
  selector: 'app-busy-time',
  templateUrl: './busy-time.component.html',
  styleUrls: ['./busy-time.component.scss']
})
export class BusyTimeComponent implements OnInit {

  @Input() public button: DotButton;
  public buttons;

  constructor(public appSettings: AppSettingsService) { }

  ngOnInit() {
    this.buttons = this.items.Buttons;
  }

  public get picture(): string {
    return `${this.appSettings.acreBridgeAssets}/Items/busyTemplate.ogg`;
  }

  items = {
    "Buttons": [
      {
        "Caption": "Spicy Style",
        "Calories": "350 CAL",
        "Combo": "Combo",
        "Single": "Only",
        "ComboPrice": "850",
        "ComboCalories": "850 CAL",
        "Price": "650"
      }
    ]
  };


}
