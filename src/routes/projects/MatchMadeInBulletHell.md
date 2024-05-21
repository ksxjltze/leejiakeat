---
layout: project
title: "Match Made in Bullet Hell"
date: '2024-05-21'

background: /images/mmibh/2x1CoverBanner-MMIBH.png
description: Bullet Hell Game Jam 2024 Submission
---

My first game jam as a part of RATHSOFT.<br/>
Match Made in Bullet Hell is a "dual-screen game" that combines bullet hell and match3 mechanics in a unique way.

## Play
See the game [here](https://rathsoft.itch.io/matchmadeinbullethell).
<iframe height="167" frameborder="0" src="https://itch.io/embed/2720643" width="552"><a href="https://rathsoft.itch.io/matchmadeinbullethell">Match Made in Bullet Hell by RATH</a></iframe><br/>

<img alt="Cover Banner" src="/images/mmibh/2x1CoverBanner-MMIBH.png">

<br/>

## Media
![Title](/images/mmibh/mmibh-title.png)
![How to play](/images/mmibh/mmibh-instructions.png)
![Selection](/images/mmibh/mmibh-selection.png)
![Gameplay](/images/mmibh/mmibh-gameplay.png)
![Graze](/images/mmibh/mmibh-graze-emote.png)
![Boss](/images/mmibh/mmibh-boss.png)
![Laser](/images/mmibh/mmibh-laser.png)
![Boss Final Phase](/images/mmibh/mmibh-boss-final.png)
![Boss Final Phase 2](/images/mmibh/mmibh-boss-final-2.png)
![Victory](/images/mmibh/mmibh-victory.png)

## Role
I was responsible for implementing the Match3 system.
I came up with the algorithm from scratch, albeit with some inspiration.<br/>
The entire system was implemented in C#, as Unity MonoBehaviour scripts.

## Match3 System
The system is very much based on the Bejeweled one, although I don't know the implementation details.

### Chain Identification Algorithm
Partly, and loosely, inspired by flood fill algorithms, the algorithm naively iterates over each gem and performs a "search" in each cardinal direction.
If the neighbouring gem is of the same color, it continues the search in that direction, otherwise it stops and returns length of the "chain".
Each neighbouring gem is simultaneously appended to a list, or "chain", if the color matches. In the end we get a nice big list of chains (i.e. a List of Lists of Gems) for further processing of chain effects, etc. 

Every gem is marked as "visited" when the algorithms sees it once, and such gems are skipped when the algorithm comes across it again, which I think leads to a nice algorithmic complexity of O(n), probably.

The algorithm is recursive, and the absence of overlapping sub-problems (I think) may well lend it well to optimization by parallelization, but that's a side quest for another time.
While far from optimal, the algorithm appears to perform reasonably well enough during gameplay.

#### Very Rough Pseudocode That Makes Many Assumptions:
```
fn BuildChain(gem, direction, chain):
    let neighbour = GetNeighbour(gem, direction)
    if SameColor(gem):
        chain.append(neighbour)
        BuildChain(neighbour, direction, chain)

fn ProcessBoard:
    let chainList
    foreach gem in gems:
        let chain

        BuildChain(gem, UP, chain)
        BuildChain(gem, DOWN, chain)
        BuildChain(gem, LEFT, chain)
        BuildChain(gem, RIGHT, chain)

        chainList.append(chain)

    return chainList
```

#### Animation
Unity Coroutines and Lerp, with closures and callbacks for post-animation processing and "Coroutine Chaining".
I had a ton of fun with this part, and it opened my eyes to the myriad possiblities of using Coroutines in Unity to do funky things.