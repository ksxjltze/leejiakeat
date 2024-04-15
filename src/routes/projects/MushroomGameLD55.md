---
layout: project
title: "Mushroom Game LD55"
date: '2024-04-15'
src: https://github.com/ksxjltze/ld55

background: /images/mushroom-game-ld55/ld55-cover.webp
description: My first game jam submission
lastUpdated: '15-04-2024'
---

This project was the first game I developed solo for a game jam (Ludum Dare 55).
It was also my first time taking part in a ludum dare.
Check it out [here.](https://ldjam.com/events/ludum-dare/55/mushroom-game-ld55)

"Mushroom Game LD55" is a simple clicker game inspired by battle cats, among other things.

The theme for the game jam was "Summoning", and oddly enough, battle cats was one of the first things that came to mind.<br/>
The other thing was the fate series, summoning servants to do your bidding, the summoning circle is as "summony" as it gets, in my opinion.<br/>
The last thing that popped into my mind alongside was gacha games, summoning seems to be pretty fitting term for acquiring characters through the gacha system, in my opinion.<br/>

As for the choice of game engine, I decided to try using the Bevy Engine, and dip my toes into rust programming.
While confusing at first, I got the hang of its immutable, borrowing weirdness after a while and have come to appreciate working with the programming paradigms of Rust and Bevy.
Querying the ECS system feels somewhat similar to querying a database with SQL, with actually using a query language.
I appreciate the opioniated-ness of the compiler, and rust language in general, it's makes my code feel clean, even though it is anything but.

My main gripes with the engine are the lack of an editor (although there's probably a plugin or library for it), and kind of wonky audio support (at time of writing).
The lack of an editor makes developing the game feel tedious at times, but I do not dislike this method of game development.

When it comes to my productivity during the game jam, let me just say that I did not spend the majority of my time during the game jam period on developing the game.
This was mainly due to certain personal circumstances (medical), as well as general procrastination and lack of motivation/mood.
I am still fairly satisfied with the end product, although I will say that I do still feel a little burned out.

The game in its current state is very unpolished, lacking proper animations, music, sound effects for most things, etc. 
While playable, I have not delved deeply into testing the game and balancing the stats of the player and enemy unit(s).

The basic gameplay is very much just a clicker game. Like cookie clicker and all those idle games, but without the idle.
The game can be summed as "Battle cats, but its a clicker, but there's only one unit, but there's only one enemy, but the enemy levels up, but you can summon a hero by sacrificing all your currency".

I implemented a basic stats system, with some basic types like Health (HP), Attack Damage (ATK), Attack Speed and Movement Speed.
As well as some other types like currency (spores) dropped on death, EXP dropped on death (not upgradable for now) and mushrooms spawned per click.

Regretably, my lack of artistic skills meant that I could not exactly implement what I wanted. Initially, I wanted to summon Saber from the fate series as the friendly "hero" to defeat the enemy hero, using her special skill (Noble Phantasm) to deal a finishing blow. Too bad, it was too grand an undertaking for a mere programmer (for now).

Art-wise, I stuck with simple pixel art, with most sprites being 64x64 pixels.
I decided to re-use the first ever sprite I drew (in DigiPen), the mushroom (boi), and added some noise. In hindsight, I should have drawn a new mushroom.

The ground is just some brown/orange with noise.
The sky is some blue, and a sun in the top left corner.

I tried to embed wasm into a HTML file for submission, and while it worked on my local development server, it failed to properly load when it was uploaded to itch.io, and at that point I was too tired to try and figure out why. It vaguely had to do with my assets not being loaded due to a 403 error (forbidden). In hindsight, maybe I should have uploaded it directly to the ludum dare website, but I was lazy to change the game's resolution to fit the requirements.