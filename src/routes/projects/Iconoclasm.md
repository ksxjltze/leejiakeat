---
layout: project
title: "Iconoclasm: Fall of the False God"
permalink: "projects/iconoclasm/"
engine: "EngineEngine"

date: '2022-09-01'
endDate: '2023-03-01'

academic: True
school: DigiPen Institute of Technology Singapore
module: Software Engineering Project 5-6

description: 3D hack-n-slash action game.

icon: /images/iconoclasm/godkillers-team-logo.png
background: /images/iconoclasm-logo.jpeg
---

Iconoclasm is a 3D hack-n-slash action game.<br>
It was developed for the Software Engineering Project 5 and Software Engineering Project 6 modules at the DigiPen Institute of Technology Singapore.

# Table of Contents
- [Software Engineering Project 5](#gam300)
    - [Engine Showcase](#gam300showcase)
    - [Technology](#gam300tech)
- [Software Engineering Project 6](#gam350)
    - [Gameplay Showcase](#gam350showcase)

<img src="/images/iconoclasm-logo.jpeg" width="100%" height="100%">

## Software Engineering Project 5 (CSD3400/GAM300): <a name="gam300"></a>
This module focuses on the development of the custom game engine, named EngineEngine, which is written from scratch in C++ with the help of third party libraries and APIs.
My role, as a programmer in a team of 10 students (Team GodKillers), was largely to build serialization systems and the asset pipeline, while playing an assisting role in the development of the graphics engine and visual effects.

The development of this entire project was a long and grueling two trimesters, tight deadlines and milestones pushed me to brainstorm and build the best systems that I could come up with in the shortest possible time. In hindsight, there is much that could be improved for the engine, but the codebase is a mess of spaghetti at this point and I reckon it would be better to start anew if I were to build a new game engine.

### Engine Showcase <a name="gam300showcase"></a>
<img src="/images/iconoclasm/iconoclasm-engine.png" width="100%" height="100%">

<iframe width="100%" height="450" src="https://www.youtube.com/embed/90ZM4lTItI8" title="GodKillers - EngineEngine Showcase" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
<i>Credit: Bryan Koh Yan Wei, Editor Programmer of Team GodKillers</i>

### Libraries:
- GLFW: Used for creating and managing windows, as well as for creating the OpenGL rendering context.
- EnTT: Provides a robust Entity Component System (ECS), for managing game entities and components.
- RapidJson: Used to simplify serialization of engine data into JSON files.
- Fmod: Audio Engine.
- dearImGUI: Used to build the engine's GUI.
- Mono: C# .NET Framework for gameplay scripting.

## Technology <a name="gam300tech"></a>
The below technical features were developed by myself, with contributions and suggestions from other teammates.
Heavy use of the C++ Standard Template Library (STL) was used to speed up development.

### Asset Pipeline
The game engine supports importing of various assets such as 3D models (.fbx, .obj), textures (.png, .dds) and audio files.
Assets that are loaded into the game engine are registered and compiled into a custom binary format.
This format allows the engine to quickly load and immediately use resources without further processing.

#### Loading Thread
When the engine is started, all files in the assets directory are processed on a separate thread.
This makes it easy to create a loading screen, using synchronization to concurrently update graphics and process files.
Operations that must be run on the main thread such as creating buffers, uploading textures or loading audio make use of std::condition_variable and atomics to achieve synchronization.

##### Example Code
```cpp
while (1)
{
    std::unique_lock<std::mutex> lock(uploadMutex);
    rm.cv.wait(lock);

    if (ContentBrowserPanel::loadScreen.stopLoading) // Check if we should stop running
        break;

    ContentBrowserPanel::loadScreen.Draw(loadCount, rm.GetResourceTable().size());

    if (ready)
        break;

    rm.uploadFunction();
    rm.waitingOnUpload = false;
}
```
<i>Loop in main thread draws the loading screen while waiting for assets to finish loading.</i>

```cpp
void ResourceManager::Upload(std::function<void()> fn)
{
    uploadFunction = fn;
    waitingOnUpload = true;

    if (s_Loaded) //initial load completed (startup), do blocking upload on current thread
    {
        uploadFunction();
        return;
    }

    cv.notify_one();

    while (1) {
        if (!waitingOnUpload)
            break;
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
}
```
<i>Upload function called from loading thread is blocking until the main thread completes the operation.</i>

#### Asset Compiler
The concept of the Asset compiler and resource descriptor (for this project) can be credited to Tomas Arce, professor and lecturer for the CSD3400/CSD3450 modules. <br><br>
When an asset is imported into the engine, a resource descriptor is generated and the the asset is compiled using an external tool, the Asset Compiler.
The external tool is aware of the engine's internal resource formats, achieved using shared header files during code compilation. 
One advantage of the asset compiler being an executable separate from the engine is that it can easily be parallelized, with multiple processes compiling assets concurrently.

#### Resource Descriptor
Every asset file has an associated descriptor which is generated during engine startup. The descriptor contains important information pertaining to how the asset should be compiled, processed, and used during runtime. The descriptor is stored as a plaintext file in a custom format for rapid prototyping and easy modification.

##### Descriptor Example
```cpp
v190922_1634
12911302302787934649
bunny
resources/model\bunny.obj
1
MaxFilter 1 1
flip_winding 0 1
WrappingV 1 0
pre_transform_vertices 0 1
IsNormalMap 0 0
WrappingU 1 0
MinFilter 1 4
```
<i>Example descriptor file: bunny.desc</i>

Regular 3D mesh files, animations, and skinned meshes can all share the same file extension (.fbx). Thus, the descriptor is important for the engine to differentiate between the types. Additionally, customizable parameters such as whether to flip normals, normalize vertices, etc. are also stored in the descriptor as key-value pairs and can be updated through the engine's editor.<br><br>
In hindsight, such information could have been represented using an internal shared format or base class for each type of model and parameters directly provided to the asset compiler during process invocation.

### Reflection
Runtime reflection, or code introspection, is an incredibly useful tool for manipulating and displaying component data in a modular fashion.
The EnTT library provides a lightweight runtime reflection system that is non-intrusive and macro-free, which is heavily used in the game engine's development.

### Serialization
Scene files and entity prefabs/archetypes are stored as JSON files on the disk. Storing data in JSON allows ease of modification of entity attributes and components, enabling rapid prototyping as well as convenient merging and copying of entity data. The rapidjson library works incredibly well for this purpose, with the majority of the serialization system built around its use.

#### Templates, functors, maps
Splitting the serialization code into smaller modular pieces allows for smooth extension of the serialization system. For example, separate function objects (i.e. a Lambda) are used to store code that can serialize integers, floating numbers, strings, vectors, etc. into JSON. 

Each function object is associated with a key, the type id of the Type to be serialized.
Using runtime reflection, this type id can be queried for any type, allowing the serializer to dynamically serialize and deserialize types to and from JSON. This modular design allows complex types to reuse the serialization code of its component types, without the need for explicit serialization of the type as a whole.

##### Code Example
```cpp
    template <typename T>
    using Entry = std::pair<entt::id_type, T>;
    using WriterEntry = Entry<PrimitiveWriter>;

    template <typename T>
    WriterEntry CreatePrimitiveWriter()
    {
        return WriterEntry(GetTypeIndex<T>(), [](WriterParams params)
        {
            auto& allocator = params.document.GetAllocator();
            params.object.AddMember(rapidjson::StringRef(params.name.data()), params.value.cast<T>(), allocator);
        });
    }
```
<i>Example of a function to create a primitive type serializer.</i>

### Material System
A dynamic material system makes it convenient to store materials as assets.
Shader uniform data is directly stored in material asset files as plaintext, allowing for easy editing using a text editor.
```
Standard
1
u_Material.color GL_FLOAT_VEC4 0 0 0 0
u_Material.normalMap GL_SAMPLER_2D 0
u_Material.AOMap GL_SAMPLER_2D 0
u_Material.roughnessMap GL_SAMPLER_2D 0
u_Material.diffuseMap GL_SAMPLER_2D 0
u_Material.specMap GL_SAMPLER_2D 0
u_Material.emissiveColor GL_FLOAT_VEC4 0 0 0 0
u_Material.emissiveMap GL_SAMPLER_2D 0
u_Material.emissiveIntensity GL_FLOAT 1
u_Material.fresScale GL_FLOAT 0
u_Material.fresRadius GL_FLOAT 0
u_Material.fresColor GL_FLOAT_VEC4 0 1 0 0
u_Material.metallic GL_FLOAT 1
u_Material.roughness GL_FLOAT 1
```
<i>Example material asset: Bunny.material</i>

## Software Engineering Project 6 (CSD3450/GAM350):  <a name="gam350"></a>
This module, which takes place a trimester after Software Engineer Project 4, focuses on developing a video game using the custom game engine that was built in the previous module.
The gameplay of Iconoclasm: Fall of the False God, is largely developed by a team of 3 designers, with the rest of the programmer team providing technical support for the engine.

<img src="/images/iconoclasm/iconoclasm-title.png" width="100%" height="100%">

### Gameplay Showcase <a name="gam350showcase"></a>
<iframe width="100%" height="450" src="https://www.youtube.com/embed/BCFzNFtZF_E" title="Iconoclasm GameplayVideo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
<i>Credit: Gavin Lim, Product Manager of Team GodKillers.</i>

### Particle System
TBC