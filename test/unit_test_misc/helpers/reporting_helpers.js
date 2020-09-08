require('colors');
var difftool = require('diff');

module.exports = {
  diffByLine: function (actual, expected) {
    var diff = difftool.diffTrimmedLines(actual, expected);
    //var diff = difftool.diffWords(actual, expected);
    var report = [];

    var lastRemoved = false;
    var lastValue = '';

    diff.forEach((item, i) => {
      if (lastRemoved && item.added) {
        if (lastValue.replace(/\s/g, '') != item.value.replace(/\s/g, '')) { //skip whitespace-only differences
          report.push('Actual:   '+lastValue['red']);
          report.push('Expected: '+item.value['grey']);
        }
      }
      else if (!item.added && !item.removed) {
        report.push(item.value['green']);
      }

      lastRemoved = item.removed;
      lastValue = item.value;
    });

    return report.join('');
  }
}
