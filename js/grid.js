const GRID_SAVE_KEY = 'farmverse-grid-v1';

export class Grid {
  constructor(cols=10, rows=10){
    this.cols = cols; this.rows = rows;
    this.tiles = []; // flattened array
    this.load();
  }

  index(x,y){ return y*this.cols + x; }

  initEmpty(){
    this.tiles = [];
    for(let y=0;y<this.rows;y++){
      for(let x=0;x<this.cols;x++){
        // simple procedural: put some water near edges and trees
        let type = 'grass';
        if(Math.random()<0.03) type='tree';
        if(Math.random()<0.03) type='rock';
        this.tiles.push({x,y,type,occupied:false,content:null});
      }
    }
  }

  ensureSize(cols,rows){ if(cols!==this.cols||rows!==this.rows){ this.cols=cols; this.rows=rows; this.initEmpty(); this.save(); }}

  getTile(x,y){ if(x<0||y<0||x>=this.cols||y>=this.rows) return null; return this.tiles[this.index(x,y)]; }

  setTile(x,y,patch){ const t=this.getTile(x,y); if(!t) return; Object.assign(t,patch); this.save(); }

  save(){ try{ localStorage.setItem(GRID_SAVE_KEY, JSON.stringify({cols:this.cols,rows:this.rows,tiles:this.tiles})); }catch(e){} }

  load(){ try{ const raw = localStorage.getItem(GRID_SAVE_KEY); if(!raw) { this.initEmpty(); return; } const data=JSON.parse(raw); this.cols=data.cols||10; this.rows=data.rows||10; this.tiles=data.tiles || []; if(this.tiles.length!==this.cols*this.rows){ this.initEmpty(); } }catch(e){ this.initEmpty(); } }

}

export function renderGrid(grid, container, onTileClick){
  container.innerHTML='';
  container.style.gridTemplateColumns = `repeat(${grid.cols}, 64px)`;
  for(const tile of grid.tiles){
    const el = document.createElement('div'); el.className='farm-tile '+(tile.type||'grass');
    el.dataset.x = tile.x; el.dataset.y = tile.y;
    const bg = document.createElement('div'); bg.className='tile-bg';
    const use = document.createElementNS('http://www.w3.org/2000/svg','svg'); use.classList.add('tile-svg'); use.setAttribute('width','32'); use.setAttribute('height','32');
    const sym = {
      grass: 'icon-grass', soil: 'icon-soil', water: 'icon-water', fence:'icon-fence', path:'icon-path', tree:'icon-tree'
    }[tile.type] || 'icon-grass';
    use.innerHTML = `<use href="#${sym}"></use>`;
    bg.appendChild(use);
    const content = document.createElement('div'); content.className='tile-content';
    if(tile.content && tile.content.crop){
      const stage = tile.content.stage||0;
      const cs = document.createElement('div'); cs.className=`crop-stage stage-${stage}`;
      cs.title = tile.content.crop;
      content.appendChild(cs);
    }
    if (tile._anim === 'plant') content.classList.add('plant-anim');
    if (tile._anim === 'harvest') content.classList.add('harvest-anim');
    tile._anim = null;
    el.appendChild(bg); el.appendChild(content);
    el.addEventListener('click', ()=> onTileClick && onTileClick(tile, el));
    container.appendChild(el);
  }
}
