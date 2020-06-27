# shogi

## 開発環境

```bash 
$ yarn
$ yarn serve
```

## db設計

```yml
state:
  turnOrder: 
  - userId1
  - userId2
  currentTurnIndex: 0
  userId1:
    orientation: [1,0]
    pieces:
    - label: ou
      position: [1,2]
    - label: fu
      position: "hand"
  userId2:
    orientation: [-1,0]
    pieces:
    - label: ou
      position: [1,2]
    - label: fu
      position: "hand"
```# shogi-deck
