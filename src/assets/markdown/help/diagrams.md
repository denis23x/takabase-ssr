## Diagrams

Enhance your user experience with dynamic and interactive [Mermaid.js](https://mermaid.js.org) diagrams! Try an innovative feature that allows users to create and embed visually compelling diagrams directly within their content. Whether you need, you have a versatile and powerful solution for all your visual communication needs.

_Graph_

``` mermaid
graph LR;
    Request([Request]);
    Response([Response]);

    Start(Start);
    Status{Status};
    Retry(Retry);
    
    Rollback(Rollback);
    Update_Posts(Save);

    Request --> Start;
    Start -.- |i++| Retry;
    Start --> Update_Posts;
    Update_Posts --> Status;
    Status --> |Error| Rollback;
    Status --> |Success| Response;
    Rollback --> Retry;
```

_Class diagram_

``` mermaid
classDiagram
    note "From Duck till Zebra"
    Animal <|-- Duck
    note for Duck "can fly\ncan swim\ncan dive\ncan help in debugging"
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
```
Support flowcharts, sequence diagrams, class diagrams, state diagrams, relationship diagrams, pie chart diagrams, gitgraph diagrams, and timeline currently provided by [Mermaid.js](https://mermaid.js.org)

