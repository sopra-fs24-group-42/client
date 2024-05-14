import React, { useState, useEffect } from "react";
import { api, handleError } from "helpers/api";
import Player from "models/Player";
import { useNavigate } from "react-router-dom";
import { Button } from "components/ui/Button";
import "styles/views/Leaderboard.scss";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import { Table } from '@mantine/core';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboardList, setLeaderboardList] = useState(null);
  const [leaderboardTable, setLeaderboardTable] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [rows, setRows] = useState(null);
  const [noPlayers, setNoPlayers] = useState(false);
  const maxNumberOfTopPlayers = 3;

  const doGetTopPlayers = async () => {
    try {
      const response = await api.get(`/leaderboards/${maxNumberOfTopPlayers}`);
      console.log(response);
      setLeaderboardList(response);
      transformListToTable();
      setRowsForTable();
    } catch (error) {
      alert(
        `Something went wrong during opening the leaderboard: \n${handleError(error)}`
      );
    }
  };

  const transformListToTable = () => {
    if (leaderboardList !== null) {
      const elementsToTable = [{}];
      for (let i = 0; i < leaderboardList.length; i++) {

        const newPlayer = {
          position: i,
          username: leaderboardList[i].username,
          numberOfWerewolfWins: leaderboardList[i].numberOfWerewolfWins,
          numberOfVillagerWins: leaderboardList[i].numberOfVillagerWins,
          numberOfWins: leaderboardList[i].numberOfWins
        };

        elementsToTable.push(newPlayer);
      }
      setLeaderboardTable(elementsToTable);
    } else {
      setNoPlayers(true);
    }
  }

  useEffect(() => {
    doGetTopPlayers();
  }, []);

  const setRowsForTable = () => {
    if (leaderboardTable !== null) {
      const rows = leaderboardTable.map((player) => (
        <Table.Tr key={player.username}>
          <Table.Td>{player.position}</Table.Td>
          <Table.Td>{player.username}</Table.Td>
          <Table.Td>{player.numberOfWerewolfWins}</Table.Td>
          <Table.Td>{player.numberOfVillagerWins}</Table.Td>
          <Table.Td>{player.numberOfWins}</Table.Td>
        </Table.Tr>
      ));
      setRows(rows);
    }
  }

  let content;
  if (noPlayers) {
    content = <h3 className="leaderboard h3">No players have played this game so far.</h3>;
  } else {
    content = (
      <Table.ScrollContainer minWidth={500}>
        <Table className="leaderboard table" verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="leaderboard table-header-position">#</Table.Th>
              <Table.Th className="leaderboard table-header-player">Player</Table.Th>
              <Table.Th className="leaderboard table-header-werewolves-wins">Werewolves Wins</Table.Th>
              <Table.Th className="leaderboard table-header-villagers-wins">Villagers Wins</Table.Th>
              <Table.Th className="leaderboard table-header-total-wins">Total Wins</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    );
  }

  return (
    <BaseContainer>
      <div className="leaderboard background-container">
        <div className="leaderboard header">Game Leaderboard</div>
        <div className="leaderboard container">
         {content}
            <div className="leaderboard button-container">
                <Button
                  width="100%"
                  height="40px"
                  onClick={() => navigate("/frontpage")}
                >
                  Back
                </Button>
            </div>
        </div>
      </div>
    </BaseContainer>
  );
};

export default Leaderboard;