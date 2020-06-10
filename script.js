let scaylaDailyIndex = -1;

$(function() {
    $('body').append(`
        <style>
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
    item.find('.js-expander').click();
    setTimeout(() => item[0].scrollIntoView(), 50);
}
function nextInScayla(index) {
    const item = $("#ghx-pool .ghx-swimlane:eq(" + (index + 1) + ")")
    const name = item.find('.ghx-heading span[role="button"]').html();
    if (name === 'Unassigned') {
        $("#next-in-scayla-name").html('Finished.');
        $("#next-in-scayla-button").attr('disabled', true);
        $("#next-in-scayla").fadeOut(8000);
    } else {
        $("#next-in-scayla-name").html('Next: <b>' + name + '</b>');
    }
}

function closeAll() {
    $("#ghx-pool .ghx-swimlane:not(.ghx-closed) .js-expander").click();
}
