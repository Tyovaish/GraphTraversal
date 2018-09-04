import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button, Picker } from 'react-native';

const TILE_TYPE = ["OPEN_TILE","WALL_TILE","START_TILE","END_TILE","WALL_TILE","CHECKED_TILE","GOLDEN_PATH_TILE"];
const TILE_ROW_SIZE = 15;
const TILE_COLUMN_SIZE = 15;

const Tile = (props) => {
  return (
    <TouchableOpacity style = {props.style} onPress = {() => props.changeTileType(props.tileId)}/>
  )
}
const TileRow = (props) => {
    const tileRow = props.tileIdArray.map((tileId) => {
      let tileStyle = props.determineTileStyle(tileId)
      return (<Tile key={tileId} style = {[tileStyle,styles.tileBox]} tileId = {tileId} changeTileType = {props.changeTileType}/>) 
    })
    return (<View style = {props.style}> {tileRow} </View>)
}

const TileGrid = (props) => {
  let tileGrid = []
  for(let startOfTileIds=0; startOfTileIds<props.tileIdArray.length;startOfTileIds+=TILE_COLUMN_SIZE){
      tileGrid.push(
        <TileRow style = {{flex: 1,  flexDirection: 'row', justifyContent: 'space-around'}} key = {startOfTileIds} tileIdArray = {props.tileIdArray.slice(startOfTileIds,startOfTileIds+TILE_COLUMN_SIZE)} determineTileStyle = {props.determineTileStyle} changeTileType = {props.changeTileType} />)
  }
  return (<View style={styles.container}> {tileGrid} </View>)
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
    for(let tileId = 0; tileId<TILE_ROW_SIZE*TILE_COLUMN_SIZE;++tileId){
      tileIdArray.push(tileId)
    }
    this.state = {
      graphTraversalType : "DFS",
      tileIdArray : tileIdArray,
      tileIdToData: tileIdArray.map((tileId)=> new TileData(tileId,"OPEN_TILE"))
    }
  }
  _runGraphSearch(){
    console.log("RUNNING SEARCH")
    this._restCheckedTiles()
    console.log("COMPLETED RESET")
    let startTileArray = this.state.tileIdToData.filter((tileData) => {
      if(tileData.tileType === "START_TILE"){
        return true;
      }
      return false;
      })

    if(startTileArray.length === 0){
      return;
    }
    let endTileArray = this.state.tileIdToData.filter((tileData) => {
      if(tileData.tileType === "END_TILE"){
        return true;
      }
      return false;
    })
    console.log("CHOOSING ALGORITHM")
    switch(this.state.graphTraversalType){
      case "DFS":
        console.log("DFS START")
        this._runDFS(startTileArray);
        console.log("DFS END")
        return;
      case "BFS":
        console.log("BFS START")
        this._runBFS(startTileArray);
        console.log("BFS END")
        return;
      case "GREEDY":
        console.log("GREEDY START")
        this._runGreedy(startTileArray,endTileArray);
        console.log("GREEDY END")
        return; 
      case "A*":
        console.log("A* START")
        this._runAStar(startTileArray,endTileArray);
        console.log("A* END")
        return;
      }
  }
  _getNeighbors(currentTileData) {    
      let neighbors = []
      for(let i = 0;i<this.state.tileIdToData.length;i++){
        let possibleNeighborTileData = this.state.tileIdToData[i]
        if(possibleNeighborTileData.position.row === currentTileData.position.row + 1 && possibleNeighborTileData.position.column === currentTileData.position.column){
          neighbors.push(possibleNeighborTileData)
        }
        if(possibleNeighborTileData.position.row === currentTileData.position.row  && possibleNeighborTileData.position.column === currentTileData.position.column + 1){
          neighbors.push(possibleNeighborTileData)
        }
        if(possibleNeighborTileData.position.row === currentTileData.position.row - 1 && possibleNeighborTileData.position.column === currentTileData.position.column){
          neighbors.push(possibleNeighborTileData)
        }
        if(possibleNeighborTileData.position.row === currentTileData.position.row && possibleNeighborTileData.position.column === currentTileData.position.column - 1){
          neighbors.push(possibleNeighborTileData)
        }
      }
      return neighbors
  }
  _createGoldenPath(endTile,connections){
    let currentTile = (connections.filter((connect)=>{
      if(connect[0].tileId === endTile.tileId){
        return true
      } 
      return false})[0])[1]
      while(currentTile.tileType !== "START_TILE"){
        currentTile.tileType = "GOLDEN_PATH_TILE"
        currentTile =  connections.filter((connect)=>{
          if(connect[0].tileId ===currentTile.tileId){
              return true
          } 
          return false})[0][1]
      }
  }
  _restCheckedTiles(){
    console.log("RESET CHECKED TILES")
    for(let i=0;i<this.state.tileIdToData.length;++i){
      if(this.state.tileIdToData[i].tileType==="CHECKED_TILE" || this.state.tileIdToData[i].tileType==="GOLDEN_PATH_TILE"){
        this.state.tileIdToData[i].tileType = "OPEN_TILE"
      }
    }
  }
  _runDFS(startTileArray){
      let dfsStack = []
      let alreadySearchedTiles = []
      let connections = []

      while(startTileArray.length !== 0){
          let startTile = startTileArray.shift();
          dfsStack.push(startTile);
          connections.push([startTile,startTile])

          while(dfsStack.length !== 0){
                let currentTileData = dfsStack.pop();
                if(currentTileData.tileType === "END_TILE"){
                  this._createGoldenPath(currentTileData,connections)
                  this.forceUpdate()
                  return;  
                }
                if(currentTileData.tileType !== "START_TILE"){
                    currentTileData.tileType = "CHECKED_TILE"
                }
                let neighbors = this._getNeighbors(currentTileData).filter((tileData) => {
                    for(let i = 0; i<alreadySearchedTiles.length; ++i){
                          if(alreadySearchedTiles[i].tileId === tileData.tileId){
                            return false;
                          }
                    }
                    for(let i = 0; i<dfsStack.length; ++i){
                      if(dfsStack[i].tileId === tileData.tileId){
                        return false;
                      }
                    }
                    return true;
                }).filter((tileData)=>{
                  if(tileData.tileType === "START_TILE" || tileData.tileType === "WALL_TILE") {
                    return false
                  }
                  return true
                })
                for(let i = 0;i<neighbors.length;i++){
                  dfsStack.push(neighbors[i])
                  connections.push([neighbors[i],currentTileData])
                  this._connectTile(neighbors[i],currentTileData,connections)
                }
                alreadySearchedTiles.push(currentTileData)
          }
      }
     this.forceUpdate()
  }
_connectTile(currentTile,tileToConnect,connections){
  for(connection in connections){
    if(connection[0].tileId === currentTile.tileId){
          connection[1]=tileToConnect
          return;
    }
  }
  connections.push([currentTile,tileToConnect])
}
  _runBFS(startTileArray){
    let bfsQueue = []
    let alreadySearchedTiles = []
    let connections = []

    while(startTileArray.length !== 0){
        bfsQueue.push(startTileArray.shift());
    }
        while(bfsQueue.length !== 0){
              let currentTileData = bfsQueue.shift();
              if(currentTileData.tileType === "END_TILE"){
                this._createGoldenPath(currentTileData,connections)
                this.forceUpdate()
                return;  
              }
              if(currentTileData.tileType !== "START_TILE"){
                  currentTileData.tileType = "CHECKED_TILE"
              }

              let neighbors = this._getNeighbors(currentTileData).filter((tileData) => {
                  for(let i = 0; i<alreadySearchedTiles.length; ++i){
                        if(alreadySearchedTiles[i].tileId === tileData.tileId){
                          return false;
                        }
                  }
                  for(let i = 0; i<bfsQueue.length; ++i){
                    if(bfsQueue[i].tileId === tileData.tileId){
                      return false;
                    }
                  }
                  return true;
              }).filter((tileData)=>{
                if(tileData.tileType === "START_TILE" || tileData.tileType === "WALL_TILE") {
                  return false
                }
                return true
              })
              for(let i = 0;i<neighbors.length;i++){
                bfsQueue.push(neighbors[i])
                this._connectTile(neighbors[i],currentTileData,connections)
              }
              alreadySearchedTiles.push(currentTileData)
    }
   this.forceUpdate()
  }
  _manhattanDistance(currentTile,endTile){
      let manHatDist =  Math.abs(currentTile.position.column - endTile.position.column) + Math.abs(currentTile.position.row - endTile.position.row)
      return manHatDist
  }
  _minimumManhattanDistance(currentTile,endTileArray){
    if(endTileArray.length===0){
          return 1;
    }
    let currentMinimumManhattanDistance = this._manhattanDistance(currentTile, endTileArray[0])
    for(let i = 1;i<endTileArray.length;++i){
      let possibleMinimumManhattanDistance = this._manhattanDistance(currentTile,endTileArray[i])
      currentMinimumManhattanDistance = possibleMinimumManhattanDistance<currentMinimumManhattanDistance?possibleMinimumManhattanDistance : currentMinimumManhattanDistance
    }
    return currentMinimumManhattanDistance 
  }
  _runGreedy(startTileArray,endTileArray){
    let greedyQueue = []
    let alreadySearchedTiles = []
    let connections = []

    while(startTileArray.length !== 0){
        greedyQueue.push([startTileArray.shift(),0]);
    }
    while(greedyQueue.length !== 0){
      greedyQueue.sort((t1,t2)=>{return t1[1]-t2[1]})
      let currentTileAndCost = greedyQueue.shift();
      let currentTileData = currentTileAndCost[0]
      let currentCost = currentTileAndCost[1]
      if(currentTileData.tileType === "END_TILE"){
        this._createGoldenPath(currentTileData,connections)
        this.forceUpdate()
        return;  
      }
      if(currentTileData.tileType !== "START_TILE"){
        currentTileData.tileType = "CHECKED_TILE"
      }

      let neighbors = this._getNeighbors(currentTileData).filter((tileData) => {
          for(let i = 0; i<alreadySearchedTiles.length; ++i){
              if(alreadySearchedTiles[i].tileId === tileData.tileId){
                return false;
              }
          }
          for(let i = 0; i<greedyQueue.length; ++i){
            if(greedyQueue[i].tileId === tileData.tileId){
              return false;
            }
          }
          return true;
      }).filter((tileData)=>{
        if(tileData.tileType === "START_TILE" || tileData.tileType === "WALL_TILE") {
          return false
        }
        return true
      })

      for(let i = 0;i<neighbors.length;i++){
        greedyQueue.push([neighbors[i],this._minimumManhattanDistance(neighbors[i],endTileArray)])
        this._connectTile(neighbors[i],currentTileData,connections)
      }
      alreadySearchedTiles.push(currentTileData)
      }
   this.forceUpdate()
  }
  _runAStar(startTileArray,endTileArray){
    let aStarQueue = []
    let alreadySearchedTiles = []
    let connections = [] 

    while(startTileArray.length !== 0){
        aStarQueue.push([startTileArray.shift(),0]);
    }
    while(aStarQueue.length !== 0){
      aStarQueue.sort((t1,t2)=>{return t1[1]-t2[1]})
      let currentTileAndCost = aStarQueue.shift();
      let currentTileData = currentTileAndCost[0]
      let currentCost = currentTileAndCost[1]
      if(currentTileData.tileType === "END_TILE"){
        this._createGoldenPath(currentTileData,connections)
        this.forceUpdate()
        return;  
      }
      if(currentTileData.tileType !== "START_TILE"){
        currentTileData.tileType = "CHECKED_TILE"
      }

      let neighbors = this._getNeighbors(currentTileData).filter((tileData) => {
          for(let i = 0; i<alreadySearchedTiles.length; ++i){
              if(alreadySearchedTiles[i].tileId === tileData.tileId){
                return false;
              }
          }
          for(let i = 0; i<aStarQueue.length; ++i){
            if(aStarQueue[i][0].tileId === tileData.tileId){
              return false;
            }
          }
          return true;
      }).filter((tileData)=>{
        if(tileData.tileType === "START_TILE" || tileData.tileType === "WALL_TILE") {
          return false
        }
        return true
      })

      for(let i = 0;i<neighbors.length;i++){
        aStarQueue.push([neighbors[i],currentCost+this._minimumManhattanDistance(neighbors[i],endTileArray)])
        this._connectTile(neighbors[i],currentTileData,connections)
      }
      alreadySearchedTiles.push(currentTileData)
      }
   this.forceUpdate()

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
  resetTileGrid(){
    const newTileIdToData = this.state.tileIdToData.map((tileData)=>{
      tileData.tileType="OPEN_TILE"
      return tileData
    })
      this.setState({tileIdToData:newTileIdToData})
  }
  render() {
    return (
      <View style ={styles.mainScreen}>
        <TileGrid determineTileStyle = {(id) => {return this.determineTileStyle(id)}} tileIdArray = {this.state.tileIdArray} changeTileType = {(id)=>{this.changeTileType(id)}}/>
        <View style = {styles.inputBox}>
          <Button style = {styles.inputBox} title ="START" onPress = {() => {this._runGraphSearch()}} />
            <Picker 
                selectedValue={this.state.graphTraversalType}
                style={{ height: 210, width: 100 }}
                onValueChange={(itemValue, itemIndex) => this.setState({graphTraversalType: itemValue})}>
                  <Picker.Item label="DFS" value="DFS" />
                  <Picker.Item label="BFS" value="BFS" />
                  <Picker.Item label="A*" value="A*"/>
                  <Picker.Item label = "GREEDY" value = "GREEDY" />
          </Picker>
          <Button style = {styles.resetBox}title ="RESET" onPress = {() => {this.resetTileGrid()}}/> 
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
    flex: 2,  
    flexDirection: 'column', 
    alignItems: 'center',
  },
  tileBox: {
    flex: 1,
    margin: ".75% .75% .75% .75%"
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
