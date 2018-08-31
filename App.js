import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, Picker } from 'react-native';

const TILE_MAP_SIZE = 176;
const TILE_TYPE = ["OPEN_TILE","WALL_TILE","START_TILE","END_TILE","WALL_TILE","CHECKED_TILE","GOLDEN_PATH_TITLE"];
const TILE_ROW_SIZE = 11;
const Tile = (props) => {
  return (
    <TouchableOpacity style = {props.style} onPress = {() => props.changeTileType(props.tileId)}/>
  )
}
const TileMap = (props) => {
  const tileMap = props.tileIdArray.map((tileId) => {
    const tileStyle = props.determineTileStyle(tileId)
    return <Tile key={tileId} style = {[tileStyle,styles.tileBox]} tileId = {tileId} changeTileType = {props.changeTileType} />
  })
  return tileMap
}

class TileData {
    constructor(tileId,tileType) {
      this.tileId = tileId
      this.tileType = tileType
      this.position = {
           row : Math.trunc(tileId/TILE_ROW_SIZE),
           column : Math.trunc(tileId%TILE_ROW_SIZE)
        }
    }
}
export default class App extends React.Component {
  constructor(props){
    super(props)
    let tileIdArray = []
    for(let tileId = 0; tileId<TILE_MAP_SIZE;++tileId){
      tileIdArray.push(tileId)
    }
    this.state = {
      graphTraversalType : "DFS",
      tileIdArray : tileIdArray,
      tileIdToData: tileIdArray.map((tileId)=> new TileData(tileId,"OPEN_TILE"))
    }
  }
  changeTileType(id) {
      let tileDataToChange = this.state.tileIdToData.filter((tileData) =>{
          if(tileData.tileId === id){
              return true
          }
          return false
      })[0]


      switch(tileDataToChange.tileType){
        case "OPEN_TILE":
        tileDataToChange.tileType = "WALL_TILE"
        break
        case "WALL_TILE":
        tileDataToChange.tileType = "START_TILE"
        break
        case "START_TILE":
        tileDataToChange.tileType = "END_TILE"
        break
        case "END_TILE":
        tileDataToChange.tileType = "OPEN_TILE"
        break
        case "CHECKED_TILE":
        tileDataToChange.tileType = "OPEN_TILE"
        break
        case "GOLDEN_PATH_TILE":
        tileDataToChange.tileType = "OPEN_TILE"
        break

      }

      let newTileIdToData =this.state.tileIdToData.map(
        (tileData)=>{
        if(tileData.tileId === tileDataToChange.tileId){
          tileData.tileType=tileDataToChange.tileType
        }
        return tileData
      } )

      this.setState({tileIdToData: newTileIdToData})
  }  
  determineTileStyle(id){
    let tileType = this.state.tileIdToData.filter((tileData) =>{
      if(tileData.tileId === id){
          return true
      }
      return false
    })[0].tileType
    switch(tileType){
      case "OPEN_TILE":
            return styles.openTile
      case "WALL_TILE":
            return styles.wallTile
      case "START_TILE":
            return styles.startTile
      case "END_TILE":
            return styles.endTile
      case "CHECKED_TILE":
            return styles.checkedTile
      case "GOLDEN_PATH_TILE":
            return styles.goldenPathTile

    }
    console.log("ERROR")
  }
  render() {
    return (
      <View style ={styles.mainScreen}>
        <View style={styles.container}>
          <TileMap determineTileStyle = {(id) => {return this.determineTileStyle(id)}} tileIdArray = {this.state.tileIdArray} changeTileType = {(id)=>{this.changeTileType(id)}}/>
        </View>
        <View style = {styles.inputBox}>
          <Button style = {styles.inputBox} title ="START" onPress = {() => {this.changeTileType(15)}} />
            <Picker
                selectedValue={this.state.graphTraversalType}
                style={{ height: 210, width: 100 }}
                onValueChange={(itemValue, itemIndex) => this.setState({graphTraversalType: itemValue})}>
                  <Picker.Item label="DFS" value="DFS" />
                  <Picker.Item label="BFS" value="BFS" />
                  <Picker.Item label="A*" value="A*"/>
                  <Picker.Item label = "GREEDY" value = "GREEDY" />
          </Picker>
          <Button style = {styles.resetBox}title ="RESET" onPress = {() => {this.changeTileType(15)}}/> 
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainScreen: {
    alignContent: 'center',
    justifyContent: 'space-around',
    flex: 1,
    top: 35,
  },
  container: {
    position: 'relative',
    flex: 2,  
    flexDirection: 'row', 
    flexWrap:"wrap",
    alignItems: 'center'
  },
  tileBox: {
    position: 'relative',
    height : 30,
    width: 30,
    margin: "0.5% 0.5% 0.5% 0.5%"
  },
  inputBox : {
    flex: 1,
    alignItems : 'center',
    justifyContent: 'center',
    flexDirection : 'row'
  }, 
  startBox : {
  },
  resetBox : {
  },
  startTile : {
    backgroundColor : "green",
  },
  endTile : {
    backgroundColor : "red",
  },
  goldenPathTile : {
    backgroundColor : "gold",
  },
  checkedTile : {
    backgroundColor : "grey",
  },
  wallTile: {
    backgroundColor : "black",
  },
  openTile: {
    backgroundColor: "blue",
  }

});
