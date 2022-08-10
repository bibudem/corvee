import v from 'io-validate'
import isUndefined from 'lodash/isUndefined'
import isNull from 'lodash/isNull'

const exists = function isExist(o) {
  return !(isUndefined(o) || isNull(o))
}

/**
 * 
 * Translates link data from the `report` format to `record` format
 * 
 * @param {string} job
 * @param {array} data
 */

export async function toRecord({
  job,
  projectId,
  data
} = {}) {

  // Arguments validation
  v(arguments[0]).not.isUndefined();
  exists(arguments[0].job)
  exists(arguments[0].data)
  v(arguments[0].data).isArray();
  v(arguments[0].job).isString();

  const result = [];

  function msgFor(reports, linkId) {
    return reports
      // .filter(report => report.level !== 'info')
      .map(report => `<li data-report-id="${linkId}" data-error-code="${report.code}">${'message' in report ? report.message : report.code}</li>`)
      .join('');
  }

  function errCodesFor(reports) {
    return reports
      // .filter(report => report.level !== 'info')
      .map(report => report.code)
      .join(', ')
  }

  function contextStackFor(parent, browsingContextStack) {
    if (typeof browsingContextStack === 'undefined' || browsingContextStack.length === 0) {
      return [parent]
    }

    const contextStack = browsingContextStack.flat(Infinity)[0];

    return [contextStack, parent]
  }

  data.forEach(
    ({
      id: linkId,
      urlData: url,
      text: label,
      finalUrl,
      parent,
      browsingContextStack,
      extern,
      reports,
    } = {
        ...item
      }) => {

      const recordData = {
        linkId,
        url,
        label,
        parent,
        context: contextStackFor(parent, browsingContextStack),
        statut: "error",
        message: msgFor(reports, linkId),
        realurl: finalUrl ? finalUrl : "",
        extern,
        action: "to-be-fixed",
        errorCode: errCodesFor(reports),
        jobId: job
      };

      result.push(recordData);
    }
  );

  return result;
}