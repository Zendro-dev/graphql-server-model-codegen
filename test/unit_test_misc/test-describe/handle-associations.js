module.exports.sample_self_assoc = `
sample.prototype.handleAssociations = async function(input, benignErrorReporter) {

    let assoc_by_sample_id = helper.checkSelfAssociations({to_one: "addParent", to_many: "addSamples"},input, input[sample.idAttribute()], benignErrorReporter);

    let promises = [];
    if (helper.isNonEmptyArray(input.addSamples) && assoc_by_sample_id) {
        promises.push(this.add_samples(input, benignErrorReporter));
    }
    if (helper.isNotUndefinedAndNotNull(input.addParent) && assoc_by_sample_id) {
        promises.push(this.add_parent(input, benignErrorReporter));
    }
    if (helper.isNonEmptyArray(input.removeSamples)) {
        promises.push(this.remove_samples(input, benignErrorReporter));
    }
    if (helper.isNotUndefinedAndNotNull(input.removeParent)) {
        promises.push(this.remove_parent(input, benignErrorReporter));
    }

    await Promise.all(promises);
}

`
