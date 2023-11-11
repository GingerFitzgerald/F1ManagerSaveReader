import {Container, Typography} from "@mui/material";
import Head from 'next/head'
import {useEffect, useState} from "react";
import Dropzone from 'react-dropzone'
import DataView from "../components/DataView";
import {analyzeFileToDatabase} from "../js/fileAnalyzer";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [db, setDb] = useState(null);
  const [version, setVersion] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const setFile = (f) => {
    analyzeFileToDatabase(f).then(({db, version, metadata}) => {
      setDb(db);
      setVersion(version);
      setMetadata(metadata);
    });
  }


  useEffect(() => {
    require('sql.js')({
      locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}`
    }).then(SQL => {
      window.SQL = SQL;
      setLoaded(true);
    });
  }, []);

  return (
    <>
      <Head>
        <title>F1 Manager Save Viewer</title>
        <meta name="description" content="F1 Manager Save Viewer by ieb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {
        loaded ? (
          <Dropzone
            onDropAccepted={files => setFile(files[0])}
            noClick
            multiple={false}
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()}>
                <Container maxWidth="xl" component="main" sx={{ pt: 1, pb: 1 }}>
                  <input {...getInputProps()} hidden />
                  <div id="dropzone">
                    {
                      version ? (
                        <>
                          <Typography variant="h5" component="h5">
                            Drag another savefile here to start over.
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="h5" component="h5">
                            Drag your F1 Manager 2022/2023 savefile here to get started.
                          </Typography>
                          <Typography variant="p" component="p" sx={{ mt: 2 }}>
                            F1 Manager 2023: %LOCALAPPDATA%\F1Manager23\Saved\SaveGames
                            <br />
                            F1 Manager 2022: %LOCALAPPDATA%\F1Manager22\Saved\SaveGames
                            <br />
                            If you are playing Xbox Store version, please use <a
                            href="https://github.com/Fr33dan/GPSaveConverter/releases">
                            GPSaveConverter
                          </a> to convert the savefile into original format.
                            <br />
                            Support for F1 Manager 2022 might be limited.
                          </Typography>
                        </>
                      )
                    }

                  </div>
                </Container>
                <Container maxWidth="xl" component="main" sx={{ pt: 1, pb: 1 }}>
                  <DataView db={db} version={version} metadata={metadata} />
                </Container>
              </div>
            )}
          </Dropzone>
        ) : (
          <Typography variant="h5" component="h5">
            Loading Database parser. Please wait.
          </Typography>
        )
      }
    </>
  )
}
