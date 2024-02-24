import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import './App.css';

export function Selectors({ selectedLang, handleLanguageChange, languages,
    selectedTrack, handleTrackChange, tracks }) {
    return <>
        <div className="language-selector-div" >
            <FormControl className="language-selector" fullWidth={false} variant='filled' size='small' >
                <InputLabel id="language-select-label">Language</InputLabel>
                <Select
                    id="language-selector"
                    value={selectedLang}
                    onChange={handleLanguageChange}
                >
                    {
                        languages.map((language, index) =>
                            <MenuItem value={language}>{language}</MenuItem>
                        )
                    }
                </Select>
            </FormControl>
        </div>
        <div className="track-selector-div" >
            <FormControl
                className="track-selector" fullWidth={false} variant='filled' size='small' >
                <InputLabel id="track-select-label">Track</InputLabel>
                <Select
                    id="track-selector"
                    onChange={handleTrackChange}
                    value={selectedTrack}
                >
                    {
                        tracks.map((track, index) =>
                            <MenuItem value={track}>{track.key}</MenuItem>
                        )
                    }
                </Select>
            </FormControl>

        </div>
    </>
}
