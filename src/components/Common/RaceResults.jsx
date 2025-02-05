import {Divider, Typography} from "@mui/material";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as React from "react";
import {useContext, useEffect, useState} from "react";
import {BasicInfoContext, DatabaseContext, VersionContext} from "../Contexts";
import ResultsTable from "./subcomponents/ResultsTable";


export default function RaceResults() {

  const database = useContext(DatabaseContext);
  const version = useContext(VersionContext);
  const basicInfo = useContext(BasicInfoContext);

  const { driverMap, player } = basicInfo;

  const [championDriverID, setChampionDriverID] = useState(0);
  const [raceSchedule, setRaceSchedule] = useState([]);
  const [driverStandings, setDriverStandings] = useState([]);
  const [driverResults, setDriverResults] = useState([]);
  const [driverTeams, setDriverTeams] = useState({});
  const [fastestLapOfRace, setFastestLapOfRace] = useState([]);

  const [season, setSeason] = useState(player.CurrentSeason);
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    let seasonList = [];
    for(let s = player.StartSeason; s <= player.CurrentSeason; s++) {
      seasonList.push(s);
    }
    setSeasons(seasonList);
    setSeason(player.CurrentSeason);
  }, [player.CurrentSeason, player.StartSeason]);

  // const [currentSeason, setCurrentSeason] = useState(2023);

  const handleChange = (event) => {
    setSeason(event.target.value);
  };




  useEffect(() => {

    // let season = player.CurrentSeason;

    let columns, values;
    let results;

    let raceSchedule = [];
    [{ columns, values }] = database.exec(
      `select * from Races JOIN Races_Tracks ON Races.TrackID = Races_Tracks.TrackID WHERE SeasonID = ${season} order by Day ASC`
    );
    for(const r of values) {
      let race = {};
      r.map((x, _idx) => {
        race[columns[_idx]] = x;
      })
      if (version === 3 && race.WeekendType === 1) {
        raceSchedule.push({ type: "sprint", race, span: 2 })
        raceSchedule.push({ type: "race", race, span: 0 })
      } else {// 2 is ATA
        raceSchedule.push({ type: "race", race, span: 1 })
      }
    }

    let driverTeams = {};
    let driverResults = {};
    let driverStandings = [];
    let fastestLapOfRace = {};
    let polePositionPoints = {};
    try {

      [{ columns, values }] = database.exec(
        version === 3 ?
          `SELECT DriverID FROM 'Races_DriverStandings' WHERE SeasonID = ${season - 1} AND RaceFormula = 1 AND Position = 1` :

          `SELECT DriverID FROM 'Races_DriverStandings' WHERE SeasonID = ${season - 1} AND Position = 1`
      );


      let [championDriverID] = values[0]; // for Car Number 1
      [{ columns, values }] = database.exec(
        version === 3 ?
          `SELECT * FROM 'Races_DriverStandings' WHERE SeasonID = ${season} AND RaceFormula = 1 ORDER BY Position ASC` :
          `SELECT * FROM 'Races_DriverStandings' WHERE SeasonID = ${season} ORDER BY Position ASC`
      );
      setChampionDriverID(championDriverID);



      for(const r of values) {
        let driverStanding = {};
        r.map((x, _idx) => {
          driverStanding[columns[_idx]] = x;
        });
        driverStandings.push(driverStanding);
      }

      if (version === 3) {
        results = database.exec(
          // `SELECT RaceID, DriverID, ChampionshipPoints FROM 'Races_QualifyingResults' WHERE SeasonID = ${season} AND QualifyingStage = 3 AND ChampionshipPoints > 0 ORDER BY RaceID ASC` // only F1 has Q3
          `SELECT RaceID, DriverID, ChampionshipPoints FROM 'Races_QualifyingResults' WHERE SeasonID = ${season} AND QualifyingStage = 3 AND FinishingPos = 1 ORDER BY RaceID ASC` // only F1 has Q3
        );
        if (results.length) {
          [{ columns, values }] = results;
          for(const [RaceID, DriverID, ChampionshipPoints] of values) {
            polePositionPoints[RaceID] = [DriverID, ChampionshipPoints]
            // console.log(polePositionPoints);
          }
        }

      }


      results = database.exec(
        `SELECT * FROM 'Races_Results' WHERE Season = ${season} ORDER BY RaceID ASC`
      );
      if (results.length) {
        [{ columns, values }] = results;
        for(const r of values) {
          let raceResult = {};
          r.map((x, _idx) => {
            raceResult[columns[_idx]] = x;
          });
          if (!fastestLapOfRace[raceResult.RaceID] || fastestLapOfRace[raceResult.RaceID] > raceResult.FastestLap && raceResult.FastestLap > 0) {
            fastestLapOfRace[raceResult.RaceID] = raceResult.FastestLap
          }
          if (!driverResults[raceResult.DriverID]) {
            driverResults[raceResult.DriverID] = {
              race: {},
              sprint: {},
            }
          }
          if (polePositionPoints[raceResult.RaceID] && polePositionPoints[raceResult.RaceID][0] === raceResult.DriverID) {
            raceResult.PolePositionPoints = polePositionPoints[raceResult.RaceID][1];
            raceResult.Points += polePositionPoints[raceResult.RaceID][1];
          }
          driverResults[raceResult.DriverID].race[raceResult.RaceID] = raceResult;
          driverTeams[raceResult.DriverID] = raceResult.TeamID;
        }
      }

      if (version === 3) {

        try {
          [{columns, values}] = database.exec(
            `SELECT *, ChampionshipPoints as Points FROM 'Races_SprintResults' WHERE SeasonID = ${season} AND RaceFormula = 1 ORDER BY RaceID ASC`
          );
          for (const r of values) {
            let raceResult = {};
            r.map((x, _idx) => {
              raceResult[columns[_idx]] = x;
            });
            if (!driverResults[raceResult.DriverID]) {
              driverResults[raceResult.DriverID] = {
                race: {},
                sprint: {},
              }
            }
            driverResults[raceResult.DriverID].sprint[raceResult.RaceID] = raceResult;
            driverTeams[raceResult.DriverID] = raceResult.TeamID;
          }
        } catch (e) {

        }

      }



      setRaceSchedule(raceSchedule);
      setDriverStandings(driverStandings);
      setDriverResults(driverResults);
      setDriverTeams(driverTeams);
      setFastestLapOfRace(fastestLapOfRace);


    } catch (e) {
      console.error(e);
    }

  }, [database, season])

  return (
    <div>
      <Typography variant="h5" component="h5">
        Race Results Overview for <FormControl variant="standard" sx={{ minWidth: 120, m: -0.5, p: -0.5, ml: 2 }}>
          <InputLabel id="demo-simple-select-standard-label">Season</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={season}
            onChange={handleChange}
            label="Season"
          >
            {seasons.map(s => <MenuItem value={s} key={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Typography>
      <Divider variant="fullWidth" sx={{ my: 2 }} />
      <div style={{ overflowX: "auto" }}>
        <ResultsTable
          formulae={1}
          version={version}
          {...{ driverTeams, championDriverID, raceSchedule, driverStandings, driverResults, fastestLapOfRace }}
        />
      </div>
    </div>
  );
}