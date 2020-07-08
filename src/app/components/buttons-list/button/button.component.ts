import { Component, OnInit, Input, Renderer2, Inject } from '@angular/core';
import { DotButton } from 'dotsdk';
import { AppSettingsService } from '../../../services';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {

  @Input() public button: DotButton;

  constructor(public appSettings: AppSettingsService) { }

  ngOnInit() {
  }

  public get picture(): string {
    return `${this.appSettings.acreBridgeAssets}/Items/${this.button.Picture}`;
  }

}
