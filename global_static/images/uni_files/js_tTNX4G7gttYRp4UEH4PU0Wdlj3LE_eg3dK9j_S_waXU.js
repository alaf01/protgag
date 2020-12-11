/**
 * @file
 * bootstrap.js
 *
 * Provides general enhancements and fixes to Bootstrap's JS files.
 */

var Drupal = Drupal || {};

(function($, Drupal){
  "use strict";

  var $document = $(document);

  Drupal.behaviors.bootstrap = {
    attach: function(context) {
      // Provide some Bootstrap tab/Drupal integration.
      $(context).find('.tabbable').once('bootstrap-tabs', function () {
        var $wrapper = $(this);
        var $tabs = $wrapper.find('.nav-tabs');
        var $content = $wrapper.find('.tab-content');
        var borderRadius = parseInt($content.css('borderBottomRightRadius'), 10);
        var bootstrapTabResize = function() {
          if ($wrapper.hasClass('tabs-left') || $wrapper.hasClass('tabs-right')) {
            $content.css('min-height', $tabs.outerHeight());
          }
        };
        // Add min-height on content for left and right tabs.
        bootstrapTabResize();
        // Detect tab switch.
        if ($wrapper.hasClass('tabs-left') || $wrapper.hasClass('tabs-right')) {
          $tabs.on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
            bootstrapTabResize();
            if ($wrapper.hasClass('tabs-left')) {
              if ($(e.target).parent().is(':first-child')) {
                $content.css('borderTopLeftRadius', '0');
              }
              else {
                $content.css('borderTopLeftRadius', borderRadius + 'px');
              }
            }
            else {
              if ($(e.target).parent().is(':first-child')) {
                $content.css('borderTopRightRadius', '0');
              }
              else {
                $content.css('borderTopRightRadius', borderRadius + 'px');
              }
            }
          });
        }
      });
    }
  };

  /**
   * Behavior for .
   */
  Drupal.behaviors.bootstrapFormHasError = {
    attach: function (context, settings) {
      if (settings.bootstrap && settings.bootstrap.formHasError) {
        var $context = $(context);
        $context.find('.form-item.has-error:not(.form-type-password.has-feedback)').once('error', function () {
          var $formItem = $(this);
          var $input = $formItem.find(':input');
          $input.on('keyup focus blur', function () {
            var value = $input.val() || false;
            $formItem[value ? 'removeClass' : 'addClass']('has-error');
            $input[value ? 'removeClass' : 'addClass']('error');
          });
        });
      }
    }
  };

  /**
   * Bootstrap Popovers.
   */
  Drupal.behaviors.bootstrapPopovers = {
    attach: function (context, settings) {
      // Immediately return if popovers are not available.
      if (!settings.bootstrap || !settings.bootstrap.popoverEnabled || !$.fn.popover) {
        return;
      }

      // Popover autoclose.
      if (settings.bootstrap.popoverOptions.triggerAutoclose) {
        var $currentPopover = null;
        $document
          .on('show.bs.popover', '[data-toggle=popover]', function () {
            var $trigger = $(this);
            var popover = $trigger.data('bs.popover');

            // Only keep track of clicked triggers that we're manually handling.
            if (popover.options.originalTrigger === 'click') {
              if ($currentPopover && !$currentPopover.is($trigger)) {
                $currentPopover.popover('hide');
              }
              $currentPopover = $trigger;
            }
          })
          .on('click', function (e) {
            var $target = $(e.target);
            var popover = $target.is('[data-toggle=popover]') && $target.data('bs.popover');
            if ($currentPopover && !$target.is('[data-toggle=popover]') && !$target.closest('.popover.in')[0]) {
              $currentPopover.popover('hide');
              $currentPopover = null;
            }
          })
        ;
      }

      var elements = $(context).find('[data-toggle=popover]').toArray();
      for (var i = 0; i < elements.length; i++) {
        var $element = $(elements[i]);
        var options = $.extend({}, $.fn.popover.Constructor.DEFAULTS, settings.bootstrap.popoverOptions, $element.data());

        // Store the original trigger.
        options.originalTrigger = options.trigger;

        // If the trigger is "click", then we'll handle it manually here.
        if (options.trigger === 'click') {
          options.trigger = 'manual';
        }

        // Retrieve content from a target element.
        var target = options.target || $element.is('a[href^="#"]') && $element.attr('href');
        var $target = $document.find(target).clone();
        if (!options.content && $target[0]) {
          $target.removeClass('element-invisible hidden').removeAttr('aria-hidden');
          options.content = $target.wrap('<div/>').parent()[options.html ? 'html' : 'text']() || '';
        }

        // Initialize the popover.
        $element.popover(options);

        // Handle clicks manually.
        if (options.originalTrigger === 'click') {
          // To ensure the element is bound multiple times, remove any
          // previously set event handler before adding another one.
          $element
            .off('click.drupal.bootstrap.popover')
            .on('click.drupal.bootstrap.popover', function (e) {
              $(this).popover('toggle');
              e.preventDefault();
              e.stopPropagation();
            })
          ;
        }
      }
    },
    detach: function (context, settings) {
      // Immediately return if popovers are not available.
      if (!settings.bootstrap || !settings.bootstrap.popoverEnabled || !$.fn.popover) {
        return;
      }

      // Destroy all popovers.
      $(context).find('[data-toggle="popover"]')
        .off('click.drupal.bootstrap.popover')
        .popover('destroy')
      ;
    }
  };

  /**
   * Bootstrap Tooltips.
   */
  Drupal.behaviors.bootstrapTooltips = {
    attach: function (context, settings) {
      if (settings.bootstrap && settings.bootstrap.tooltipEnabled) {
        var elements = $(context).find('[data-toggle="tooltip"]').toArray();
        for (var i = 0; i < elements.length; i++) {
          var $element = $(elements[i]);
          var options = $.extend({}, settings.bootstrap.tooltipOptions, $element.data());
          $element.tooltip(options);
        }
      }
    }
  };

  /**
   * Anchor fixes.
   */
  var $scrollableElement = $();
  Drupal.behaviors.bootstrapAnchors = {
    attach: function(context, settings) {
      var i, elements = ['html', 'body'];
      if (!$scrollableElement.length) {
        for (i = 0; i < elements.length; i++) {
          var $element = $(elements[i]);
          if ($element.scrollTop() > 0) {
            $scrollableElement = $element;
            break;
          }
          else {
            $element.scrollTop(1);
            if ($element.scrollTop() > 0) {
              $element.scrollTop(0);
              $scrollableElement = $element;
              break;
            }
          }
        }
      }
      if (!settings.bootstrap || settings.bootstrap.anchorsFix !== '1') {
        return;
      }
      var anchors = $(context).find('a').toArray();
      for (i = 0; i < anchors.length; i++) {
        if (!anchors[i].scrollTo) {
          this.bootstrapAnchor(anchors[i]);
        }
      }
      $scrollableElement.once('bootstrap-anchors', function () {
        $scrollableElement.on('click.bootstrap-anchors', 'a[href*="#"]:not([data-toggle],[data-target],[data-slide])', function(e) {
          if (this.scrollTo) {
            this.scrollTo(e);
          }
        });
      });
    },
    bootstrapAnchor: function (element) {
      element.validAnchor = element.nodeName === 'A' && (location.hostname === element.hostname || !element.hostname) && (element.hash.replace(/#/,'').length > 0);
      element.scrollTo = function(event) {
        var attr = 'id';
        var $target = $(element.hash);
        // Check for anchors that use the name attribute instead.
        if (!$target.length) {
          attr = 'name';
          $target = $('[name="' + element.hash.replace('#', '') + '"]');
        }
        // Immediately stop if no anchors are found.
        if (!this.validAnchor && !$target.length) {
          return;
        }
        // Anchor is valid, continue if there is an offset.
        var offset = $target.offset().top - parseInt($scrollableElement.css('paddingTop'), 10) - parseInt($scrollableElement.css('marginTop'), 10);
        if (offset > 0) {
          if (event) {
            event.preventDefault();
          }
          var $fakeAnchor = $('<div/>')
            .addClass('element-invisible')
            .attr(attr, $target.attr(attr))
            .css({
              position: 'absolute',
              top: offset + 'px',
              zIndex: -1000
            })
            .appendTo($scrollableElement);
          $target.removeAttr(attr);
          var complete = function () {
            location.hash = element.hash;
            $fakeAnchor.remove();
            $target.attr(attr, element.hash.replace('#', ''));
          };
          if (Drupal.settings.bootstrap.anchorsSmoothScrolling) {
            $scrollableElement.animate({ scrollTop: offset, avoidTransforms: true }, 400, complete);
          }
          else {
            $scrollableElement.scrollTop(offset);
            complete();
          }
        }
      };
    }
  };

  /**
   * Tabledrag theming elements.
   */
  Drupal.theme.tableDragChangedMarker = function () {
    return '<span class="tabledrag-changed glyphicon glyphicon-warning-sign text-warning"></span>';
  };

  Drupal.theme.tableDragChangedWarning = function () {
    return '<div class="tabledrag-changed-warning alert alert-warning messages warning">' + Drupal.theme('tableDragChangedMarker') + ' ' + Drupal.t('Changes made in this table will not be saved until the form is submitted.') + '</div>';
  };

})(jQuery, Drupal);
;
/* 
 * Różne skrypty dotyczące frontendu
 * 
 * @author: Gabriela Leoniec gaba@ug.edu.pl
 * @copyright: Uniwersytet Gdański
 */


jQuery.noConflict();
jQuery(document).ready(function ($) {

    // $.getScript("/sites/all/themes/ug_theme/js/images_to_greyscale.js", function () {
    //     console.log("images_to_greyscale");
    //     $('img').each(function () {
    //         console.log($(this));
    //     });
    // });

    /**************************/
// Powiększanie czcionki - chowanie i pokazywanie przycisków
    var cookie = $.cookie('text_resize');
    var inc = $('#text_resize_increase');
    var dec = $('#text_resize_decrease');
    var res = $('#text_resize_reset');
// Pierwsze wejście na stronę lub ciasteczka wyłączone
    if (cookie === null) {
// SlideUp - chowanie do góry elementów
        res.hide(0);
        dec.hide(0);
    } else {
        dec.show(0);
        res.show(0);
    }

    inc.click(function () {
        dec.slideDown();
        res.slideDown();
    });
    res.click(function () {
        dec.slideUp();
        res.slideUp();
    });
    /**************************/
// Top Scroll
//browser window scroll (in pixels) after which the "back to top" link is shown
    var offset = 300,
            //browser window scroll (in pixels) after which the "back to top" link opacity is reduced
            offset_opacity = 1200,
            //duration of the top scrolling animation (in ms)
            scroll_top_duration = 700,
            //grab the "back to top" link
            $back_to_top = $('.cd-top');
    //hide or show the "back to top" link
    $(window).scroll(function () {
        ($(this).scrollTop() > offset) ? $back_to_top.addClass('cd-is-visible') : $back_to_top.removeClass('cd-is-visible cd-fade-out');
        if ($(this).scrollTop() > offset_opacity) {
            $back_to_top.addClass('cd-fade-out');
        }
    });
    $back_to_top.click(function (event) {
        event.preventDefault();
        $("html, body").animate({
            scrollTop: 0
        }, scroll_top_duration);
        return false;
    });
    /**************************/
    // Changelog toggle visibility on button press
    var changelog = function () {

        function open(el) {
            $(el).next('.group-zmiany').slideDown("fast");
            $('> div', el).css("background-position", "-90px -45px");
            $(el)
                    .mouseover(function () {

                        $('> div', this).css("background-position", "-105px -45px");
                    })
                    .mouseout(function () {
                        $('> div', this).css("background-position", "-90px -45px");
                    });
        }

        function close(el) {
            $(el).next('.group-zmiany').slideUp("fast");
            $('> div', el).css("background-position", "-105px 0px");
            $(el)
                    .mouseover(function () {
                        $('> div', el).css("background-position", "-105px -15px");
                    })
                    .mouseout(function () {
                        $('> div', el).css("background-position", "-105px 0");
                    });
        }
        ;

        var changelogs = [];
        changelogs = $('.group-zmiany');
        var len = changelogs.length;
        //console.log('Ilość elementów o klasie .group-zmiany: ' + len);
        for (var i = 0; i < len; i++) {
            console.log('Aktualny element: ' + i);
            var el = changelogs[i];
            $(changelogs[i]).addClass('zmiana' + i);
            $(changelogs[i]).before('<a href="#" class="toggle tog' + i + '"><div></div>Pokaż rejestr zmian</a>');
            $(changelogs[i]).hide();
            $(".tog" + i).toggle(
                    function () {
                        //console.log($(this).attr('class'));
                        open($(this));
                    },
                    function () {
                        close($(this));
                    });
        }
        ;
    };



    var animateBorder = function (el) {
        $(window).load(function () {
            $(el).animate({
                width: "90%",
                height: "90%"
            }, 200, function () {
            });
        });
    };

    function getCookie(name) {
        name = name + "=";
        var x = document.cookie;
        var tab = x.split(';');

        for (i = 0; i < tab.length; i++) {
            v = tab[i].replace(/^\s+|\s+$/gm, '');
            if (v.indexOf(name) === 0) {
                value = v.substring(name.length, v.length);
                return value;
            }
        }
    }
    function setCookie(name, value) {
        var d = new Date();
        d.setTime(d.getTime() + (10*365*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = name + "=" + value + '; '+ expires + '; path=/';
    }

    function cookiesInfo() {
        var c = getCookie('ug_cookie_info');

        if (c == 1) {
            $('#copyright .cookies').hide();
        } else {
            $('#copyright .cookies').show();
            $('#copyright .cookies .cookiex').click(function () {
                setCookie('ug_cookie_info', 1);
                $('#copyright .cookies').hide("slow");
            });
        }
    };

    cookiesInfo();
    changelog();
    animateBorder('#region-content .view-pole-wydzial-aktualny a.active div.ramka_waska');
//----------------      


    $('#search-block-form .input-group-btn button[type=submit]').toggle();
    $('#search-block-form .input-group input[name=search_block_form]').toggle();
    $('#search-block-form .input-group .input-group-btn').append('<button id="search-button" type="button" class="btn float-r w-auto"><span class="icon glyphicon glyphicon-search"></span></button>');
    $("#search-button").click(function(){
        $("#search-button").hide();
        $('#search-block-form .input-group-btn button[type=submit]').toggle();
        $('#search-block-form .input-group input[name=search_block_form]').toggle();
        $('#search-block-form .input-group input[name=search_block_form]').focus();
        $("#search-button").toggleClass('btn-primary').blur().focusout();
    });

});;
