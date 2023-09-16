async function fetchUrl(){
    const url = 'https://soundcloud-scraper.p.rapidapi.com/v1/track/metadata?track=https://soundcloud.com/bensonboone/in-the-stars?si=51709ce00fc84b6eb90f6f4e39fbc3ef&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing';
    // Replace the track url with your song url from Sound Cloud, do not change the api url, start replacing after "track="
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '2657c3174amsh6544a839cdba094p152544jsn7a8dd7851607',
            'X-RapidAPI-Host': 'soundcloud-scraper.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options);
    const result = await response.json();
    loadUrl = result.audio[0].url;
    
    let audioUrl = loadUrl 
    let fileName = "song.mp3"; // Replace the name and the extension with yours.

    /**
     * Download an audio file in the default directory.
     * @param {string} url Audio URL.
     * @param {string} name File name with extension. If a file with the same name exists, the browser will postfix it with something like "(1)".
     */
    async function download(url, name) {

        // Regularly checks the progress until it equals `1`.
        while (true) {
            let headRes = await fetch(url, { method: 'HEAD' })
            switch (headRes.status) {
            case 202: // Queuing or processing
            case 200: // Completed
                break
            case 403: // Invalid or expired
                throw new Error('The URL is invalid or expired.')
            default: // Unknown
                throw new Error(`Unknown error. Status: ${headRes.status}.`)
            }
            let isQueuing = headRes.headers.get('x-scd-is-queuing') === 'true'
            if (isQueuing) {
            console.log('Queuing...')
            } else {
            let progress = Number(headRes.headers.get('x-scd-progress'))
            console.log(`Processing: ${(progress * 100).toFixed(1)}%`)
            if (progress === 1) {
                console.log(`File size: ${headRes.headers.get('content-length')} bytes`)
                break
            }
            }
            // Waits for 1 second (1000 milliseconds).
            await new Promise(x => setTimeout(x, 1000))
        }

        // Now the URL has become a normal URL of an audio file.
        //console.log('Downloading...')
        document.getElementById("status").innerHTML = `<p>Downloading</p>`

        // Use `XMLHttpRequest` instead of `fetch` to query download progress.
        // We just use `fetch` here to simply demonstrate the usage.
        let getRes = await fetch(url, { method: 'GET' })

        // Response header arrives.
        switch (getRes.status) {
            case 200: // OK
            break
            case 403: // Expired
            throw new Error('The URL is expired.')
            default: // Unknown
            throw new Error(`Unknown error. Status: ${getRes.status}.`)
        }

        // Waits the file to arrive.
        let blob = await getRes.blob()
        //console.log('Download completed')
        document.getElementById("status").innerHTML = `<p>Download Completed</p>`

        // Saves the file.
        console.log('Saving file... (click "allow" if the browser asks for download permission)')
        let el = document.createElement('a')
        el.href = URL.createObjectURL(blob)
        el.download = name
        el.click()
        URL.revokeObjectURL(el.href)

    }

    download(audioUrl, fileName)
}

fetchUrl();




