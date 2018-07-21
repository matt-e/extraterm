/*
 * Copyright 2018 Simon Edwards <simon@simonzone.com>
 *
 * This source code is licensed under the MIT license which is detailed in the LICENSE.txt file.
 */
import { WebComponent, Attribute, Observe } from 'extraterm-web-component-decorators';
import { ViewerElement } from '../viewers/ViewerElement';
import { Logger, getLogger } from 'extraterm-logging';
import { TextViewer } from '../viewers/TextAceViewer';
import { BlobBulkFileHandle } from '../bulk_file_handling/BlobBulkFileHandle';
import { VirtualScrollCanvas } from '../VirtualScrollCanvas';
import { RefreshLevel } from '../ResizeRefreshElementBase';

export const VUE_TEXT_ACE_VIEWER_ELEMENT_TAG = "et-vue-text-ace-viewer-element";

@WebComponent({tag: VUE_TEXT_ACE_VIEWER_ELEMENT_TAG})
export class VueTextAceViewerElement extends ViewerElement {

  private _log: Logger = null;
  private _textViewer: TextViewer = null;
  private _scrollCanvas: VirtualScrollCanvas = null;

  constructor() {
    super();
    this._log = getLogger(VUE_TEXT_ACE_VIEWER_ELEMENT_TAG, this);
  }

  connectedCallback(): void {
    super.connectedCallback();

    if (this.childElementCount === 0) {
      this._scrollCanvas = <VirtualScrollCanvas> document.createElement(VirtualScrollCanvas.TAG_NAME);

      this._textViewer = <TextViewer> document.createElement(TextViewer.TAG_NAME);
      this._scrollCanvas.setViewerElement(this._textViewer);
      this._setText(this.getAttribute("viewer-text") || "");
      const mimeType = this.getAttribute("mime-type") || "text/plain";
      this._setMimeType(mimeType);
      this.appendChild(this._scrollCanvas);

      this._scrollTextViewerToTop();
    }
  }

  private _scrollTextViewerToTop(): void {
    this._textViewer.setDimensionsAndScroll({
      height: 150,
      heightChanged: true,
      yOffset: 0,
      yOffsetChanged: true,
      physicalTop: 0,
      physicalTopChanged: true,
      containerHeight: 150,
      containerHeightChanged: true,
      visibleBottomOffset: 0,
      visibleBottomOffsetChanged: true
    });
  }

  @Attribute viewerText: string;

  @Observe("viewerText")
  private _updateViewerText(target: string): void {
    this._setText(this.viewerText);
  }

  private _setText(viewerText: string): void {
    if (this._textViewer == null) {
      return;
    }

    const mimeType = this.getAttribute("mimeType") || "text/plain";
    const newBulkFileHandle = new BlobBulkFileHandle(mimeType + ";charset=utf8", {}, Buffer.from(viewerText, 'utf8'));
    this._textViewer.setBulkFileHandle(newBulkFileHandle);

    this._scrollTextViewerToTop();

    this._scrollCanvas.refresh(RefreshLevel.COMPLETE);  // FIXME
  }

  @Attribute mimeType: string;

  @Observe("mimeType")
  private _updateMimeType(target: string): void {
    this._setMimeType(this.mimeType);
  }

  private _setMimeType(mimeType: string): void {
    if (this._textViewer == null) {
      return;
    }
    this._textViewer.setMimeType(mimeType);
  }
}
