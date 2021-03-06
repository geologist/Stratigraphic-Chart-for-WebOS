function TableAssistant() {
    /* this is the creator function for your scene assistant
       object. It will be passed all the additional parameters (after
       the scene name) that were passed to pushScene. The reference to
       the scene controller (this.controller) has not be established
       yet, so any initialization that needs the scene controller
       should be done in the setup function below. */

    this.link = Mojo.appPath + 'data/isc2009_base_age.html';
    this.powerScroll = false;
    this.powerScrollBounceOffset = 12;
}


TableAssistant.prototype.setup = function() {
    /* this function is for setup tasks that have to happen when
       the scene is first created */

    if (this.controller.stageController.setWindowOrientation) {
        this.controller.stageController.setWindowOrientation("free");
    }

    /* use Mojo.View.render to render view templates and add them
       to the scene, if needed */

    /* setup widgets here */

    this.controller.setupWidget(Mojo.Menu.appMenu, StratChart.appMenuAttr,
                                StratChart.appMenuModel);

    this.controller.setupWidget('stratTable', { url: this.link,
                                                interrogateClicks: true,
                                                showClickedLink: true });
    this.stratTableWidget = this.controller.get('stratTable');

    /* add event handlers to listen to events from widgets */

    /* "Power scroll" -- flick with two fingers to top/bottom */
    this.gestureStart = this.gestureStart.bindAsEventListener(this);
    this.gestureEnd = this.gestureEnd.bindAsEventListener(this);
};


TableAssistant.prototype.activate = function($super, event) {
    /* put in event handlers here that should only be in effect when
       this scene is active. For example, key handlers that are
       observing the document */

    if (this.powerScroll) {
	this.controller.listen(this.controller.stageController.document, "gesturestart", this.gestureStart);
	this.controller.listen(this.controller.stageController.document, "gestureend", this.gestureEnd);
    }

    this.eventHandlerLinkDetails = this.handleLinkDetails.bind(this);
    Mojo.Event.listen(this.stratTableWidget, Mojo.Event.webViewLinkClicked,
                      this.eventHandlerLinkDetails);
};


TableAssistant.prototype.deactivate = function($super, event) {
    /* remove any event handlers you added in activate and do any
       other cleanup that should happen before this scene is popped or
       another scene is pushed on top */

    if (this.powerScroll) {
	this.controller.stopListening(this.controller.stageController.document, "gesturestart", this.gestureStart);
	this.controller.stopListening(this.controller.stageController.document, "gestureend", this.gestureEnd);
    }

    Mojo.Event.stopListening(this.stratTableWidget,
                             Mojo.Event.webViewLinkClicked,
                             this.eventHandlerLinkDetails);
};


TableAssistant.prototype.cleanup = function(event) {
    /* this function should do any cleanup needed before the scene is
       destroyed as a result of being popped off the scene stack */
};




/* after click, open details for stratigraphic unit */

TableAssistant.prototype.handleLinkDetails = function(clickEvent) {
    var unit = clickEvent.url.split("/").pop();
    Mojo.Controller.stageController.pushScene("details", unit);
};



/* Power scroll handlers */

TableAssistant.prototype.gestureStart = function(event) {
	this.gestureStartY = event.centerY;
};

TableAssistant.prototype.gestureEnd = function(event) {
    this.gestureEndY = event.centerY;
    this.gestureDistance = this.gestureEndY - this.gestureStartY;
    var scroller = this.controller.getSceneScroller();
    var pos;
    if (this.gestureDistance > 0) {
	this.controller.getSceneScroller().mojo.revealTop();
        pos = scroller.mojo.getScrollPosition();
        scroller.mojo.scrollTo(0, pos.top - this.powerScrollBounceOffset, true);
    } else if (this.gestureDistance < 0) {
	this.controller.getSceneScroller().mojo.revealBottom();
        pos = scroller.mojo.getScrollPosition();
        scroller.mojo.scrollTo(0, pos.top + this.powerScrollBounceOffset, true);
    }
};
