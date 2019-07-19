import { CustomWebView, CustomLoadEventData, NavigationType } from "./customwebview";
import { ContainerView, Property, EventData, CSSType } from "tns-core-modules/ui/core/view";
import { File, knownFolders, path } from "tns-core-modules/file-system";

export { File, knownFolders, path, NavigationType };
export * from "tns-core-modules/ui/core/view";

export const srcProperty = new Property<WebViewBase, string>({ name: "src" });

@CSSType("WebView")
export abstract class WebViewBase extends ContainerView implements CustomWebView {
  public static loadStartedEvent = "loadStarted";
  public static loadFinishedEvent = "loadFinished";
  public static urlLoadingEvent = "urlLoading";

  public src: string;

  public _onLoadFinished(url: string, error?: string) {
    let args = <CustomLoadEventData>{
      eventName: WebViewBase.loadFinishedEvent,
      object: this,
      url: url,
      navigationType: undefined,
      error: error
    };

    this.notify(args);
  }

  public _onLoadStarted(url: string, navigationType: NavigationType) {
    let args = <CustomLoadEventData>{
      eventName: WebViewBase.loadStartedEvent,
      object: this,
      url: url,
      navigationType: navigationType,
      error: undefined
    };

    this.notify(args);
  }

  public _onUrlLoading(url: string, navigationType: NavigationType) {
    let args = <CustomLoadEventData>{
      eventName: WebViewBase.urlLoadingEvent,
      object: this,
      url: url,
      navigationType: navigationType,
      error: undefined
    };

    this.notify(args);
  }

  abstract loadUrl(src: string): void;

  abstract _loadData(src: string): void;

  abstract stopLoading(): void;

  get canGoBack(): boolean {
    throw new Error("This member is abstract.");
  }

  get canGoForward(): boolean {
    throw new Error("This member is abstract.");
  }

  abstract goBack(): void;

  abstract goForward(): void;

  abstract reload(): void;

  [srcProperty.getDefault](): string {
    return "";
  }
  [srcProperty.setNative](src: string) {
    this.stopLoading();

    // Add file:/// prefix for local files.
    // They should be loaded with _loadUrl() method as it handles query params.
    if (src.indexOf("~/") === 0) {
      src = `file:///${knownFolders.currentApp().path}/` + src.substr(2);
    } else if (src.indexOf("/") === 0) {
      src = "file://" + src;
    }

    // loading local files from paths with spaces may fail
    if (src.toLowerCase().indexOf("file:///") === 0) {
      src = encodeURI(src);
    }

    if (src.toLowerCase().indexOf("http://") === 0 ||
        src.toLowerCase().indexOf("https://") === 0 ||
        src.toLowerCase().indexOf("file:///") === 0) {
      this.loadUrl(src);
    } else {
      this._loadData(src);
    }
  }
}

export interface WebViewBase {
  on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
  on(event: "loadFinished", callback: (args: CustomLoadEventData) => void, thisArg?: any);
  on(event: "loadStarted", callback: (args: CustomLoadEventData) => void, thisArg?: any);
  on(event: "urlLoading", callback: (args: CustomLoadEventData) => void, thisArg?: any);
}

srcProperty.register(WebViewBase);
