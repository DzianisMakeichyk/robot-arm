 
import {Robot} from '@types'
import { Euler } from 'three'

/**
 * Defines a Mesh with material and location
 *
 * @param node The GLTF Mesh
 * @param data The node 3d data
 */


const Mesh = ({node, data}: Robot.MeshProperties) => {
    //   @ts-ignore
    const rotation = data.rotation.length > 0 ? new Euler().fromArray(data.rotation) : new Euler(0, 0, 0)

    return (
        <mesh geometry={node.geometry}
              material={node.material}
              position={data.position}
              rotation={rotation}
              scale={data.scale}
        />
    )
}

export default Mesh
