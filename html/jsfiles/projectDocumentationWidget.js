window.Spring = window.Spring || {};

/* ERB style templates conflict with Jekyll HTML escaping */
_.templateSettings = {
  evaluate    : /\{@([\s\S]+?)@\}/g,
  interpolate : /\{@=([\s\S]+?)@\}/g,
  escape      : /\{@-([\s\S]+?)@\}/g
};

Spring.ProjectDocumentationWidget = function () {
  var codeEl = $('[code-widget-controls]');
  var codeWidgetEl = $('.js-code-maven-widget');

  var projectUrl = apiBaseUrl + "/project_metadata/" + projectId;
  var promise = Spring.loadProject(projectUrl);

  promise.then(function (project) {
    Spring.buildCodeWidget(codeEl, codeWidgetEl, project);
  });
};

Spring.buildCodeWidget = function (codeEl, codeWidgetEl, project) {
  new Spring.CodeSelectorView({
    el: codeEl,
    model: project,
    template: $("#code-widget-controls-template").text(),
    snippetWidgetEl: codeWidgetEl
  }).render();
}

Spring.loadProject = function (url) {
  return $.ajax(url, {
    dataType: 'jsonp',
    processData: false
  }).then(function (value) {
      return new Spring.Project(value);
    });
}

Spring.Release = function (data) {
  _.extend(this, data);
}



Spring.Project = function (data) {
  _.extend(this, data);
  var self = this;
  this.releases = _.map(this.projectReleases, function (r) {
    return new Spring.Release(r);
  });

  return this;
};



Spring.SnippetView = Backbone.View.extend({
  initialize: function () {
      for (i=1; i<3 ; i++) {
          var y = document.getElementById('foobar'+i);
          var z = document.getElementById('baz'+i);
          if (y.style.display === 'none') {
              y.style.display = 'block';
              z.style.display = 'none';
          } else {
              y.style.display = 'none';
              z.style.display = 'block';
          }
      }
    _.bindAll(this, "render");
  },

  render: function () {

    var html = $(this.combinedTemplate(this.model));
    this.$el.html(html);
    Spring.buildCopyButton(html.find(":first"), "snippet");
    return this;
  },

  remove: function() {
    this.undelegateEvents();
    this.$el.empty();
    this.unbind();
  }
});

Spring.CodeSelectorView = Backbone.View.extend({
  events: {
    "change .selector": "renderActiveWidget",
    "click .js-item": "changeCodeSource"
  },

  initialize: function () {
    this.template = _.template(this.options.template);
    this.snippetWidgetEl = this.options.snippetWidgetEl;
    _.bindAll(this, "render", "renderActiveWidget", "changeCodeSource", "_moveItemSlider", "selectCurrent");
  },

  render: function () {
    this.$el.html(
      this.template(this.model)
    );
    this.renderActiveWidget();
    this.selectCurrent();
    this.$('.selectpicker').selectpicker();
    return this;
  },

  selectCurrent: function() {
      var selectedIndex = $('.selectpicker [data-current="true"]').val();
      if(selectedIndex == undefined) {
        selectedIndex = 0;
      }
      this.$('.selectpicker').val(selectedIndex).change();
  },

  renderActiveWidget: function() {
    if(this.activeWidget != null) this.activeWidget.remove();

    this.activeWidget = new Spring.SnippetView({
      el: this.snippetWidgetEl,
      model: this.model.releases[this.$('.selector :selected').val()],
      snippetType: this.$('.js-active').data('snippet-type')
    });
    this.activeWidget.render();

  },

  changeCodeSource: function (event) {
    var target = $(event.target);

    target.addClass("js-active");
    target.siblings().removeClass("js-active");

    this._moveItemSlider();
    this.renderActiveWidget();
  },

  _moveItemSlider: function () {
    var activeItem = $(".js-item-slider--wrapper .js-item.js-active");
    if (activeItem.length == 0) {
      return;
    } else {
      var activeItemPosition = activeItem.position();
      var activeItemOffset = activeItemPosition.left;
      var activeItemWidth = activeItem.outerWidth();

      var slider = $(".js-item--slider");
      var sliderPosition = slider.position();
      var sliderOffset = sliderPosition.left;
      var sliderTarget = activeItemOffset - sliderOffset;

      slider.width(activeItemWidth);
      slider.css("margin-left", sliderTarget);
    }
  }

});
