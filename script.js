let scaylaDailyIndex = -1;

$(function() {
    $('body').addClass('daily-time').append(`
        <style>
          body.daily-time #ghx-column-header-group {
            /*top: -20px !important;*/
          }
          body.daily-time #ghx-column-header-group, body.daily-time #ghx-column-header-group .ghx-column {
            background: transparent !important;
            border-bottom: none !important;
          }
          body.daily-time #ghx-pool .ghx-swimlane:not(.ghx-closed) .ghx-swimlane-header {
            opacity: 0 !important;
          }
          #next-in-scayla {
            position: fixed;
            right: 20px;
            bottom: 50px;
            min-width: 125px;
            height: 50px;
            background: white;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
            box-shadow: 0 0 6px -1px #666;
            border-radius: 7px;
          }
          #next-in-scayla-name {
            padding-right: 20px;
          }
        </style>
        <div id="next-in-scayla">
            <span id="next-in-scayla-name"></span>
            <button
              id="next-in-scayla-button"
              class="aui-button aui-button-primary aui-style"
              >Next</button>
        </div>`);

    $("#ghx-operations").hide();

    $("#next-in-scayla-button").click(function() {
        closeAll();
        setTimeout(() => {
            ++scaylaDailyIndex;
            expandItem(scaylaDailyIndex)
            nextInScayla(scaylaDailyIndex);
        }, 100);
    }).trigger('click');
});

function expandItem(index) {
    const item = $("#ghx-pool .ghx-swimlane:eq(" + index + ")")
    const name = item.find('.ghx-heading span[role="button"]').html();
    if (name === 'Unassigned') {
        $("#next-in-scayla-name").html('Finished.');
        $("#next-in-scayla-button").attr('disabled', true);
        $("#next-in-scayla").fadeOut(8000, () => {
            window.location.reload();
        });
        $("body").removeClass('daily-time');
    } else {
        item.find('.js-expander').click();
        $("#subnav-title").html(name);
        $("#ghx-board-name").html('Now speaking:');
        setTimeout(() => item[0].scrollIntoView(), 50);
    }
}
function nextInScayla(index) {
    const item = $("#ghx-pool .ghx-swimlane:eq(" + (index + 1) + ")")
    const name = item.find('.ghx-heading span[role="button"]').html();
    $("#next-in-scayla-name").html('Next: <b>' + name + '</b>');
  
}

function closeAll() {
    $("#ghx-pool .ghx-swimlane:not(.ghx-closed) .js-expander").click();
}
