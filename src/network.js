export async function CallPlay(preparedTrack, sourceInput, selectedLang) {
    var trackArgs = {}
    var track = {}

    // Since track can have multiple kind of arguments
    //    1. No argumens
    //    2. Arguments with no value
    //    3. Arguments with values
    // This block prepares track for the request with current state of arguments
    if (preparedTrack.argumentMap.length === 0) {
        track = preparedTrack.key
    } else if (preparedTrack.argumentMap.length === 1 && preparedTrack.argumentMap[0].value == null) {
        track[preparedTrack.key] = preparedTrack.argumentMap[0].key
    } else {
        preparedTrack.argumentMap.forEach((arg) => {
            trackArgs[arg.key] = arg.value
        })
        track[preparedTrack.key] = trackArgs
    }

    var requestBody = JSON.stringify({
        source: sourceInput,
        language: selectedLang,
        track: track
    })

    // Set all state after Getting response
    const response = await fetch('https://lyfkykbisow7zkharariyw26ia0zppmy.lambda-url.us-east-1.on.aws/play', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: requestBody
    })
    return response
}